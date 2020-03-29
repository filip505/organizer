import React, { Component } from 'react'
import style from '../css/error.component.scss'
import errorIcon from '../assets/errorIcon.png'
import closeIcon from '../assets/closeIcon.png'
import { shell } from 'electron'

class ErrorComponent extends Component {

    constructor(props) {
        super(props)
        this.state = { details: false }
        console.log('PROPS', props)
    }

    render() {
        const { onClick, error, onClose } = this.props
        const { file, message } = error
        const { details } = this.state

        return (
            <div className={style.container} >
                <div className={style.title} onClick={() => { onClick(error.file); this.setState({ details: !this.state.details }); }}>
                    <img src={errorIcon} />
                    <div>{file.name}</div>
                    {details && <img src={closeIcon} onClick={() => onClose(file)} />}
                </div>
                {details && <div className={style.details} onClick={()=>shell.openItem(file.newDirectory)}>
                    <div>error: {message}</div>
                    <div>path: {file.newDirectory} </div>
                </div>}
            </div>
        )
    }

}

export default ErrorComponent