import React from 'react'
import style from '../css/button.component.scss'

export default function ({ title, icons, onClick }) {
    return <div className={style.container} onClick={onClick}>
        {icons && icons.map((icon) => <img src={icon} />)}
        <div>{title}</div>
    </div>
}