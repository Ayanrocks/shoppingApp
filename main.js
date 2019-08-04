const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set Environment
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;


// Listen for app to be ready
app.on('ready', function() {
    // Create new WIindow
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }})
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    // QUit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});


// Handle Add Window
function createAddWindow(){
    // Create new WIindow
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    })
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    // garbage collection
    addWindow.on("closed",() => {
        addWindow = null;
    })
}

// Catch IPCRenderer item:add
ipcMain.on('item:add', function(e,item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close()
})


// Create Menu Template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow()
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                },
            }
        ]
    }
]

// IF mac add empty object to menu
if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({})
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        submenu: [
            {
                label: 'Toggle Devtools',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}