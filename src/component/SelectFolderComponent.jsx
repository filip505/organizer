import React from 'react'
import fs from 'fs'
import { remote } from 'electron'

export default ({ onFolderSelect }) => {
    const selectFolder = () => {
        const { dialog } = remote
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            // console.log('path', result.filePaths[0])
            const result = { filePaths: ["/Users/filip/Documents/cover"] }
            fs.readdir(result.filePaths[0], (err, files) => {
                files = files.filter(file => !file.startsWith('.')).map((file) => ({ path: result.filePaths[0] + '/' + file, name: file, directory: result.filePaths[0] }))
                onFolderSelect(files)
            });
        }).catch(err => {
            console.log(err)
        })
    }
    return (
        <div>
            <div>select folder</div>
            <form>
                <input type='file' directory="" webkitdirectory="" onChange={(event) => console.log(Array.from(event.target.files))} />
                <button type='submit'>submit</button>
                <div id='list'></div>
            </form>
            <div onClick={() => selectFolder()}>submit</div>

        </div>
    )
}