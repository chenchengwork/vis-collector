import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import css from './Mark.scss';

export class MarkMove extends PureComponent {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        icon: PropTypes.string,
        desc: PropTypes.string,
        number: PropTypes.number.isRequired,
    };

    state = {
        number: this.props.number
    };

    updateNumber = (number) => this.setState({number})

    render() {
        const {width, height, icon, desc} = this.props;
        const contentHeight = 20;
        const columnHeight = height - contentHeight;

        return (
            <div className={css["mark-move"]} style={{width, height}}>
                <div className={css.content} style={{height: contentHeight, borderRadius: contentHeight / 2}}>
                    <div className={css.icon}>
                        <i className={`iconfont ${icon}`} />
                    </div>
                    <span className={css.desc}>{desc}</span>
                    <span className={css.number}>{this.state.number}</span>
                </div>
                <div className={css.column} style={{width: 2, height: columnHeight}}></div>
            </div>
        );
    }
}

export class MarkCamera extends PureComponent{
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        bgColor: PropTypes.string.isRequired
    };

    state = {
        bgColor: this.props.bgColor
    };

    render() {
        const { width, height } = this.props;
        const { bgColor } = this.props;

        return (
            <div className={css["mark-camera"]} style={{width, height, backgroundColor: bgColor}}>

            </div>
        )
    }
}


