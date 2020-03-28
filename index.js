const { app, BrowserWindow, ipcMain, Menu } = require('electron')

const fs = require('fs')

let mainWindow
let statusWindow
let taskList = []
let errorList = []

const ERROR = {
    FILE_EXISTS: { message: 'fileExists' }
}

const checkIfFileExsists = (file) => () => new Promise((resolve, redject) => {
    if (fs.existsSync(file.newDirectory)) {
        redject({ ...ERROR.FILE_EXISTS, file: file })
    } else {
        resolve()
    }
})

const moveFileTask = (file) => () => new Promise((resolve, redject) => {
    // setTimeout(() => {
    //     console.log('done')
    //     resolve()
    // }, 1000)
    checkIfFileExsists(file).then(() => {
        fs.rename(file.oldDirectory, file.newDirectory, function (err) {
            if (err) throw redject(err)
            console.log('Successfully moved ' + file.name)
            resolve()
        }).catch((err) => console.log('greska', err))
    })

})

const copyFileTask = (file) => () => new Promise((resolve, redject) => {
    checkIfFileExsists(file)().then(() => {
        fs.copyFile(file.oldDirectory, file.newDirectory, function (err) {
            if (err) {
                redject(err)
            }
            console.log('Successfully copied ' + file.name)
            resolve()
        })
    }).catch((err) => redject(err))
})


const runAllTasks = async (resolve, redject) => {
    while (taskList.length) {
        const task = taskList.pop()
        try {
            await task.run()

            mainWindow.webContents.send(
                'task:add',
                taskList
            )
        } catch (error) {
            console.log('error', error)
            if (ERROR.FILE_EXISTS.message == error.message) {
                errorList.unshift(error)
                mainWindow.webContents.send(
                    'task:error',
                    errorList
                )
            }
        }
    }

    setTimeout(runAllTasks, 5000)
    console.log('empty')
}

runAllTasks()

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'organize',
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false,
            nativeWindowOpen: true,
            webSecurity: false
        }
    })
    mainWindow.loadFile('src/index.html')
    mainWindow.on('closed', () => app.quit())
    const mainMenu = Menu.buildFromTemplate(menuTemplate)
    // Menu.setApplicationMenu(mainMenu)

    // app.on('window-all-closed', () => {
    //     // On macOS it is common for applications and their menu bar
    //     // to stay active until the user quits explicitly with Cmd + Q
    //     if (process.platform !== 'darwin') {
    //         app.quit()
    //     }
    // })

    // app.on('activate', () => {
    //     // On macOS it's common to re-create a window in the app when the
    //     // dock icon is clicked and there are no other windows open.
    //     if (BrowserWindow.getAllWindows().length === 0) {
    //         createWindow()
    //     }
    // })




    ipcMain.on('folder:move', (event, file) => {
        const name = `moving ${file.name} to ${file.newDirectory}`
        const run = moveFileTask(file)
        const task = { name, run }
        taskList.unshift(task)

        mainWindow.webContents.send(
            'task:add',
            taskList.map((task) => ({ name: task.name }))
        )
    })

    ipcMain.on('folder:copy', (event, file) => {
        const name = `copying ${file.name} to ${file.newDirectory}`
        const run = copyFileTask(file)
        const task = { name, run }
        taskList.unshift(task)

        mainWindow.webContents.send(
            'task:add',
            taskList.map((task) => ({ name: task.name }))
        )
    })
})

const menuTemplate = [

    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() {
                    app.quit()
                }
            }
        ]
    }
]

if (process.platform == 'darwin') {
    menuTemplate.unshift(
        { label: 'File' }
    )
}

if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
        label: 'View',
        submenu: [
            {
                label: 'Toggle Developer Tools',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        ]
    })
}
