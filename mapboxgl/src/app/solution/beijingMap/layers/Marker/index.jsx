import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import "./font/iconfont.css";
import css from './index.scss';

// 转移犯人
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
        const {width, height, icon, desc, bgColor} = this.props;
        const contentHeight = 20;
        const carWidth = 15;
        const carHeight = 10;
        const columnHeight = height - contentHeight - carHeight;

        return (
            <div className={css.move} style={{width, height}}>
                <div className={css.content} style={{height: contentHeight, borderRadius: contentHeight / 2}}>
                    <div className={css.icon} style={{backgroundColor: bgColor}}>
                        <i className={`iconfont ${icon}`} />
                    </div>
                    <span className={css.desc}>{desc}</span>
                    <span className={css.number}>{this.state.number}</span>
                </div>

                <div style={{width: 2, height: columnHeight, backgroundImage: `-webkit-linear-gradient(bottom, rgba(128, 139, 150, 0.5) 0%, ${bgColor} 100%)`}} />

                <div>
                    <div className={css.center} style={{width: carWidth, height: carHeight, backgroundColor: "rgba(211, 84, 0 ,1)"}}>
                        <i className={`iconfont icon-dkw_qiche`} />
                    </div>
                    <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: `${carWidth/2}px solid transparent`,
                        borderRight: `${carWidth/2}px solid transparent`,
                        borderTop: `${carWidth/2}px solid rgba(211, 84, 0 ,1)`
                    }}></div>
                </div>


            </div>
        );
    }
}

// 摄像头
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
            <div className={css.camera} style={{width, height, backgroundColor: bgColor}}>
                <i className={`iconfont icon-shexiangtou`} style={{fontSize: 12}} />
            </div>
        )
    }
}

// 警察
export class Police extends PureComponent{
    render(){
        const { width, height } = this.props;
        return (
            <div className={css.center} style={{width, height}}>
                <i className={`iconfont icon-jingmao`} style={{fontSize: 30, color: "#00FDFC"}} />
            </div>
        )
    }
}


// 监狱
export class Prison extends PureComponent {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        icon: PropTypes.string,
        desc: PropTypes.string,
    };

    render() {
        const {width, height, name} = this.props;
        const contentHeight = 20;
        const imgHeight = 30;
        const columnHeight = height - contentHeight - imgHeight;

        return (
            <div className={css.prison} style={{width, height}}>
                <div className={css.content} style={{ height: contentHeight }}>
                    <div className={css.icon}>
                        <i className={`iconfont icon-jianyu`} />
                    </div>
                    <span className={css.name}>{name}</span>
                </div>
                <div className={css.column} style={{width: 2, height: columnHeight}}></div>
                <img src={require("./img/prison.png")}  style={{width: width / 2, height: imgHeight}} />
            </div>
        );
    }
}
