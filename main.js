const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')

// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV === 'development' ? true : false;
const isWin = process.platform === 'win32' ? true : false;
const isMac = process.platform === 'darvin' ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow () {
    mainWindow = new BrowserWindow({
      title: 'ImageShrinker',
      width: isDev ? 1400 : 500,
      height: 600,
      icon: './assets/icons/Icon_32x32.png',
      resizable: isDev ? true : false,
      backgroundColor: 'white',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });

    if(isDev) {
      mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow () {
    aboutWindow = new BrowserWindow({
      title: 'About ImageShrinker',
      width: 300,
      height: 300,
      icon: './assets/icons/Icon_32x32.png',
      resizable: false,
      backgroundColor: 'white',
    });

    aboutWindow.loadFile('./app/about.html')
}

// menu begins **************
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow
            }
          ]
        }
      ]
    : []),
  {
    role: 'fileMenu'
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' }
          ]
        }
      ]
    : []),
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow
            }
          ]
        }
      ]
    : {})
];
// menu ends ************

ipcMain.on('imageToMinimize', (e, options) => {
  e.preventDefault();
  
  options.dest = path.join(os.homedir(), 'Desktop/Image-Shrink');
  shrinkImage(options);
})

const shrinkImage = async ({imgPath, quality, dest}) => {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({quality}),
        imageminPngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    })
    console.log(files);
  shell.openPath(dest)

  } catch (error) {
    console.log(error)
  }
}

app.on('window-all-closed', function () {
  if (!isMac) app.quit();
});

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('ready', () => mainWindow = null);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});
