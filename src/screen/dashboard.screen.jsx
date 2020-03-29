import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Resizable } from 're-resizable'
import style from '../css/dashboard.scss'
import { remote, ipcRenderer } from 'electron'
import PreviewComponent from '../component/PreviewComponent'
import DisplayComponent from '../component/DisplayComponent'
import SelectFolderComponent from '../component/SelectFolderComponent'
import fs from 'fs'
import ph from 'path'
import ButtonComponent from '../component/ButtonComponent'
import folderIcon from '../assets/folderIcon.png'
import arrowRight from '../assets/arrowRight.png'
import syncIcon from '../assets/syncIcon.png'
import copyIcon from '../assets/copyIcon.png'
import ErrorComponent from '../component/ErrorComponent'

const icons = {
    moveFile: folderIcon,
    copyFile: copyIcon
}

class DashboardComponent extends Component {

    constructor(props) {
        super(props)
        this.state = {
            directories: [],
            tasks: [],
            // errors: [{
            //     message: "fileExists",
            //     file: {
            //         name: "75474046_2017110938444151_1442132164094197760_o.jpg",
            //         oldDirectory: "/Users/filip/Documents/cover/75474046_2017110938444151_1442132164094197760_o.jpg"
            //     }
            // }],
            errors: [],
            file: null,
            files: null,
            error: null,
            leftPanelWidth: 200,
            rightPanelWidth: 200
        }
        ipcRenderer.on('task:add', (event, tasks) => {
            this.setState({ tasks })
        })
        ipcRenderer.on('task:error', (event, { errorList, taskList }) => {
            this.setState({ errors: errorList, tasks: taskList })
        })

        this.onFileSelected = (file, files) => {
            if (file) {
                fs.stat(file.path, (err, stats) => {
                    file = { ...file, ...stats }
                    if (files) {
                        this.setState({ file, files })
                    } else {
                        this.setState({ file })
                    }
                })
            } else {
                this.setState({ files: [], file: null })
            }

        }

        this.sortByName = (files) => {
            files = files.sort(function (a, b) {
                if (a.name < b.name) { return -1; }
                if (a.name > b.name) { return 1; }
                return 0;
            })
            return files
        }

        this.onFolderSelect = (files) => {
            if (files.length > 0) {
                files = this.sortByName(files)
                const file = files[0]
                file.index = 0
                this.onFileSelected(file, files)
            } else {
                this.setState({ error: 'empty folder' })
            }
        }

        this.selectFolder = (action) => {
            const { dialog } = remote
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                if (!result.canceled) {
                    const directories = this.state.directories
                    directories.push({ path: result.filePaths[0], action })
                    this.setState({ directories })
                }
            }).catch(err => {
                console.log(err)
            })
        }

        this.moveFile = (directory) => {
            const { file } = this.state
            file.newDirectory = directory
            file.oldDirectory = file.path
            const files = this.state.files.filter((f) => f.name !== file.name)
            const activeFile = file.index > 0 ? files[file.index - 1] : files[file.index]
            ipcRenderer.send('folder:move', { file, errors: this.state.errors })
            this.onFileSelected(activeFile, files)
        }

        this.copyFile = (directory) => {
            const { file } = this.state
            file.newDirectory = directory
            file.oldDirectory = file.path
            ipcRenderer.send('folder:copy', { file, errors: this.state.errors })
        }

        this.deleteFile = () => {
            const { file } = this.state
            file.oldDirectory = file.path
            const files = this.state.files.filter((f) => f.name !== file.name)
            const activeFile = file.index > 0 ? files[file.index - 1] : files[file.index]
            ipcRenderer.send('folder:delete', { file, errors: this.state.errors })
            this.onFileSelected(activeFile, files)
        }

        this.onErrorClick = (activeFile) => {
            let { files } = this.state
            if (files.length > 0) {
                for (let file of files) {
                    if (file.name === activeFile.name) {
                        this.onFileSelected(file)
                        return
                    }
                }
            }

            files = this.sortByName([...files, activeFile])
            this.onFileSelected(activeFile, files)
        }

        document.onkeydown = (e) => {
            if (e.keyCode == '38') {

                const { file, files } = this.state
                const activeFile = file.index > 0 ? files[file.index - 1] : file
                this.onFileSelected(activeFile)
            }
            else if (e.keyCode == '40') {

                const { file, files } = this.state
                const activeFile = file.index < files.length - 1 ? files[file.index + 1] : file
                this.onFileSelected(activeFile)
            }
        }
    }

    renderTask(task) {
        return (
            <div className={style.task}><img src={syncIcon} /><div>{task.name}</div></div>
        )
    }

    renderDirectory(directory, action) {
        // ReactDOM.createPortal(this.props.children, window.open('').document.body)
        console.log('action', action)
        return <ButtonComponent
            key={directory}
            title={directory}
            icons={[arrowRight, icons[action]]}
            onClick={() => this[action](directory)} />
    }


    renderRightPanel(file) {
        const formatBytes = (a, b) => { if (0 == a) return "0 Bytes"; var c = 1024, d = b || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c)); return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f] }
        file = file ? file : {}
        return (
            <div className={style.rightPanelContainer}>
                <div>
                    <div className={style.info}>
                        <div className={style.data}><b>Name: </b>{file.path ? ph.basename(file.path) : ''}</div>
                        <div className={style.data}><b>Created At: </b>{file.atime ? file.atime.toLocaleString() : ''}</div>
                        <div className={style.data}><b>Size: </b>{file.size ? formatBytes(file.size) : ''}</div>
                    </div>


                    <ButtonComponent
                        title={'Move to...'}
                        icons={[folderIcon]}
                        onClick={() => this.selectFolder('moveFile')} />

                    <ButtonComponent
                        title={'Copy to...'}
                        icons={[folderIcon]}
                        onClick={() => this.selectFolder('copyFile')} />

                    <div>
                        {this.state.directories.map(({ path, action }) => this.renderDirectory(path, action))}
                        {this.state.errors.map((error, index) => <ErrorComponent
                            key={index}
                            error={error}
                            onClick={this.onErrorClick}
                            onClose={({ name }) => this.setState({ errors: this.state.errors.filter(({ file }) => file.name !== name) })}
                        />)}
                        {this.state.tasks.map(task => this.renderTask(task))}
                    </div>
                </div>
                <ButtonComponent
                        title={'Delete...'}
                        icons={[folderIcon]}
                        onClick={this.deleteFile} />
            </div>
        )

    }

    render() {
        let { files, file, error } = this.state
        if (error) {
            return <div>{error}</div>
        }

        return (
            <div>
                {!files && <SelectFolderComponent onFolderSelect={this.onFolderSelect} />}
                {files &&
                    <div className={style.container}>
                        <Resizable
                            className={style.leftpanel}
                            size={{ width: this.state.leftPanelWidth, height: '100%' }}
                            onResizeStop={(e, direction, ref, d) => this.setState({ leftPanelWidth: this.state.leftPanelWidth + d.width })}
                        >
                            {files.map((f, index) => {
                                f.index = index
                                return <PreviewComponent key={f.name} active={file} file={f} onClick={this.onFileSelected} />
                            })}
                        </Resizable>


                        {file && <DisplayComponent file={file} />
                            // <img src={file.path} style={{ width: window.innerWidth - this.state.rightPanelWidth - this.state.leftPanelWidth, height: '100vh', objectFit: 'contain' }} />
                        }


                        <Resizable
                            className={style.rightpanel}
                            enable={{ left: true, right: false }}
                            size={{ width: this.state.rightPanelWidth, height: '100%' }}
                            onResizeStop={(e, direction, ref, d) => this.setState({ rightPanelWidth: this.state.rightPanelWidth + d.width })}
                        >
                            {this.renderRightPanel(file)}
                        </Resizable>

                    </div>
                }

            </div>
        )
    }
}

export default DashboardComponent