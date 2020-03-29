import React from 'react'
import fs from 'fs'
import { remote } from 'electron'
import style from '../css/selectFolder.scss'

export default ({ onFolderSelect }) => {
    const selectFolder = () => {
        const { dialog } = remote
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            // console.log('path', result.filePaths[0])
            // const result = { filePaths: ["/Users/filip/Documents/cover"] }
            fs.readdir(result.filePaths[0], (err, files) => {
                files = files.filter(file => !file.startsWith('.')).map((file) => ({ path: result.filePaths[0] + '/' + file, name: file, directory: result.filePaths[0] }))
                onFolderSelect(files)
            });
        }).catch(err => {
            console.log(err)
        })
    }
    return (
        <div className={style.container}>
            <div className={style.item} onClick={() => selectFolder()}>CLICK TO SELECT FOLDER</div>
        </div>
    )
}