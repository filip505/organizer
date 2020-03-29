import React, { Component } from 'react'
import style from '../css/directory.scss'
import { arrowRight, copyFile, folderIcon, labelIcon } from '../images'
import { shell } from 'electron'

class DirectoryComponent extends Component {
    constructor(props) {
        super(props)
        const name = props.path.split('/')
        this.state = { display: false, name: name[name.length - 1] }
    }

    render() {
        const { name, display } = this.state
        const { path, onCopy, onMove } = this.props
        return (
            <div className={style.container}>

                <div className={style.title} onClick={() => this.setState({ display: !display })}>
                    <img src={labelIcon} />
                    <div>{name}</div>
                </div>

                {display &&
                    <div>
                        <div className={style.title} onClick={() => shell.openItem(path)}>
                            <img src={folderIcon} />
                            <div>{path}</div>
                        </div>

                        <div className={style.items} >
                            <div className={style.item} onClick={() => onMove(path)}>
                                <img src={arrowRight} />
                                <div>Move</div>
                            </div>
                            <div className={style.item} onClick={() => onCopy(path)}>
                                <img src={copyFile} />
                                <div>Copy</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default DirectoryComponent