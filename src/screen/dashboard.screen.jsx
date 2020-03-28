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
import ErrorComponent from '../component/ErrorComponent'

class DashboardComponent extends Component {

    constructor(props) {
        super(props)
        this.state = {
            directories: [],
            tasks: [],
            errors: [{
                message: "fileExists",
                file: {
                    name: "75474046_2017110938444151_1442132164094197760_o.jpg",
                    oldDirectory: "/Users/filip/Documents/cover/75474046_2017110938444151_1442132164094197760_o.jpg"
                }
            }],
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

        this.onFolderSelect = (files) => {
            if (files.length > 0) {
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
            file.newDirectory = directory + '/' + file.name
            file.oldDirectory = file.path
            const files = this.state.files.filter((f) => f.name !== file.name)
            const activeFile = file.index > 0 ? files[file.index - 1] : null
            // ipcRenderer.send('task:add', file)
            console.log('sending file', file)

            ipcRenderer.send('folder:move', file)
            this.onFileSelected(activeFile, files)
        }

        this.copyFile = (directory) => {
            const { file } = this.state
            // file.newDirectory = directory + '/' + file.name
            // file.oldDirectory = file.path
            ipcRenderer.send('folder:copy', { name: file.name, oldDirectory: file.path, newDirectory: directory + '/' + file.name })
        }

        this.onError = (error) => {

        }

        document.onkeydown = (e) => {
            if (e.keyCode == '38') {

                const { file, files } = this.state
                console.log('files.index', file.index + ' > 0')
                const activeFile = file.index > 0 ? files[file.index - 1] : file
                this.onFileSelected(activeFile)
            }
            else if (e.keyCode == '40') {

                const { file, files } = this.state
                console.log('files.index', file.index + ' < ' + files.length)
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
        return <ButtonComponent
            key={directory}
            title={directory}
            icons={[arrowRight, folderIcon]}
            onClick={() => this[action](directory)} />
    }


    renderRightPanel(file) {
        const formatBytes = (a, b) => { if (0 == a) return "0 Bytes"; var c = 1024, d = b || 2, e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], f = Math.floor(Math.log(a) / Math.log(c)); return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f] }
        file = file ? file : {}
        this.state.directories.map((directory) => console.log('directory', directory))
        return (
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
                    {this.state.errors.map(error => <ErrorComponent error={error} onClick={this.onError} />)}
                    {this.state.tasks.map(task => this.renderTask(task))}
                </div>
            </div>
        )

    }

    render() {
        let { files, file, error } = this.state
        if (error) {
            return <div>{error}</div>
        }
        console.log('FILE', file)
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