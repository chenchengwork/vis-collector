import React, {
    PureComponent,
    useState,
    useEffect
} from 'react';


export default class TestReactHook extends PureComponent {

    state = {
        isRemoveTestHook: false
    }

    render() {
        const { isRemoveTestHook } = this.state;

        return (
            <div>
                <button onClick={() => this.setState({isRemoveTestHook: true})}>remove test hook</button>

                { isRemoveTestHook ? null : <TestUseState /> }
            </div>
        );
    }
}

// ----以下是测试React Hooks----------


const TestUseState = () => {
    const [ count, setCount ] = useState(0);

    /*
        说明： 副作用方法的调用都是在render之后
        useEffect Hooks 视作 componentDidMount、componentDidUpdate 和 componentWillUnmount 的结合
     */
    useEffect(() => {
        console.log(document.querySelector("#a"))

        return () => {
            console.log("componentWillUnmount")
        }
    });

    return (
        <div id="a">
            <p>你点击了{count}次</p>
            <button onClick={() => setCount(count + 1)}>
                点我
            </button>
        </div>
    );
}




