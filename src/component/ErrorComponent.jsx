import React, { Component } from 'react'
import style from '../css/error.component.scss'
import errorIcon from '../assets/errorIcon.png'
import closeIcon from '../assets/closeIcon.png'

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
            <div className={style.container} onClick={() => { onClick(error.file); this.setState({ details: !this.state.details }); }}>
                <div className={style.title}>
                    <img src={errorIcon} />
                    <div>{file.name}</div>
                    {details && <img src={closeIcon} onClick={() => onClose(file)} />}
                </div>
                {details && <div className={style.details}>
                    <div>error: {message}</div>
                    <div>path: {file.directory} </div>
                </div>}
            </div>
        )
    }

}

export default ErrorComponent