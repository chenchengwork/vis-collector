import React, { PureComponent } from 'react';
import css from './index.scss';

export default class Circle extends PureComponent{
    render() {
        return (
            <div className={css.circle}></div>
        )
    }
}
