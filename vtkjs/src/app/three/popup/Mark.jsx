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
    }
    state = {

    };

    updateNumber = () => {

    }

    render() {
        const {width, height} = this.props;
        const contentHeight = 20;
        const columnHeight = height - contentHeight;

        return (
            <div className={css["mark-move"]} style={{width, height}}>
                <div className={css.content} style={{height: contentHeight, borderRadius: contentHeight / 2}}>
                    <div className={css.icon}>
                        <i className="iconfont icon-jiaohuan"/>
                    </div>
                    <span className={css.desc}>转运犯人 | 人数: </span>
                    <span className={css.number}>20</span>
                </div>
                <div className={css.column} style={{width: 2, height: columnHeight}}></div>
            </div>
        );
    }
}

export class MarkCamera extends PureComponent{

    render() {
        return (
            <div className={css["mark-camera"]}>

            </div>
        )
    }
}


