import React from 'react'
import ph from 'path'
import fileIcon from '../assets/fileIcon.png'

const supportedFormats = {
    image: [
        '.apng',
        '.bmp',
        '.gif',
        '.ico',
        '.cur',
        '.jpg',
        '.jpeg',
        '.jfif',
        '.pjpeg',
        '.pjp',
        '.png',
        '.svg',
        '.tif',
        '.tiff',
        '.webp'
    ],
    video: [
        '.mp4',
        '.webm',
        '.ogg',
        '.mov'
    ]
}

const renderPhoto = (file) => (
    <div style={{ width: '100%' }}>
        <img style={{ width: '100%', height: '100%', objectFit: 'contain' }} src={file.path} />
    </div>
)

const renderVideo = (file) => (
    <div>
        <video style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls>
            <source src={file.path} />
        </video>
    </div >
)

const renderFile = (file) => (
    <div>
        <img src={fileIcon} />
    </div >
)

export default function ({ file }) {
    const extname = ph.extname(file.name)

    if (supportedFormats.image.includes(extname)) {
        return renderPhoto(file)
    }

    else if (supportedFormats.video.includes(extname)) {
        return renderVideo(file)
    }
    else {
        return renderFile(file)
    }
}