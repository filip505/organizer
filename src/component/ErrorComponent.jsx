import React, { Component } from 'react'
import style from '../css/error.component.scss'
import errorIcon from '../assets/errorIcon.png'

class ErrorComponent extends Component {

    constructor(props) {
        super(props)
        this.state = { details: false }
        console.log('PROPS', props)
    }

    render() {
        const { file, message } = this.props.error
        const { details } = this.state
        return (
            <div className={style.container} onClick={() => this.setState({ details: true })}>
                <div className={style.title}>
                    <img src={errorIcon} />
                    <div>{file.name}</div>
                </div>

                {details && <div className={style.details}>Error: {message}</div>}
            </div>
        )
    }

}

export default ErrorComponent