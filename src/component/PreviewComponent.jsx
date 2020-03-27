import React from 'react'
import ph from 'path'
import style from '../css/preview.component.scss'

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
        '.ogg'
    ]
}


const renderPhoto = (file, active, onClick) => (
    <div className={active && active.name===file.name? style.containerActive: style.container}>
        <img onClick={() => onClick(file)} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} src={file.path} />
    </div>
)

const renderVideo = (file, active, onClick) => (
    <div className={active && active.name===file.name? style.containerActive: style.container}>
        <video onClick={() => onClick(file)} width="100%" height="auto">
            <source src={file.path} />
        </video>
    </div >
)


export default function ({ file, active, onClick }) {
    const extname = ph.extname(file.name)

    if (supportedFormats.image.includes(extname)) {
        return renderPhoto(file, active, onClick)
    }

    else if (supportedFormats.video.includes(extname)) {
        return renderVideo(file, active, onClick)
    }
    else {
        return null
    }
}