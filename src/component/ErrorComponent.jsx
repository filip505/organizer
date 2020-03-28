import React from 'react'
import style from '../css/error.component.scss'
import errorIcon from '../assets/errorIcon.png'

export default ({ error }) => {
    console.log('error', error)
    const { message, file } = error
    return <div className={style.container}><img src={errorIcon} /><div>{file.name}</div></div>
}
