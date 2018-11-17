import React, { PureComponent } from 'react';

/*
  SVG SMIL animation动画详解
  https://www.zhangxinxu.com/wordpress/2014/08/so-powerful-svg-smil-animation/
 */

export default class Index extends PureComponent {


    render() {

        return (
            <div>
                <svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <text font-family="microsoft yahei" font-size="120" y="160" x="160">马</text>
                        <animateTransform attributeName="transform" begin="0s" dur="10s" type="rotate" from="0 160 160" to="360 160 160" repeatCount="indefinite"/>
                    </g>
                </svg>
            </div>
        );
    }
}



