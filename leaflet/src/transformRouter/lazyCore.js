/*
    异步组件同步加载的核心包
 */

import React from "react";
const DefaultSpin = () => <div>loading...</div>

class ErrorBoundary extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error(error);
    }

    render() {
        if (this.state.hasError) {
            return <div>对不起,页面加载失败</div>;
        }

        return this.props.children;
    }
}

/**
 * 默认loading参数
 * @type {*[]}
 */
const defaultLoading = [DefaultSpin, {}];


export default (AsyncCom, loading = defaultLoading) => {
    const Com = React.lazy(() => AsyncCom);

    if(!Array.isArray(loading)){
        throw new Error("loading必须是数组");
    }

    if(typeof loading[0] !== 'function'){
        throw new Error("loading的第一个参数必须是组件");
    }

    const Loading = loading[0];
    const loadingProps = loading[1] || {};

    return (props) => (
        <ErrorBoundary>
            <React.Suspense fallback={<Loading {...loadingProps}/>}>
                <Com {...props} />
            </React.Suspense>
        </ErrorBoundary>
    );
};
