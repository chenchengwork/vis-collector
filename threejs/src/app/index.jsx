import React, { PureComponent, Fragment } from 'react';

// 组件
import LoadModel from './LoadModel';
// import Earth from './Earth';
// import EarthFlightLine from './EarthFlightLine';
// import LoadTileMapToThreeJS from './LoadTileMapToThreeJS';

const EnumType = [
	{
		label: "加载3D模型",
		value: 1,
		component: () => <LoadModel />
	},

	// {
	// 	label: "加载地球",
	// 	value: 2,
	// 	component: () => <Earth />
	// },
	//
	// {
	// 	label: "加载Tile地图到ThreeJS",
	// 	value: 3,
	// 	component: () => <LoadTileMapToThreeJS />
	// },
	//
	// {
	// 	label: "加载地球飞线",
	// 	value: 4,
	// 	component: () => <EarthFlightLine />
	// },
];

const EnumTypeToItemMap = (() => {
	let typeToItemMap = {};

	EnumType.forEach(item => typeToItemMap[item.value] = item);

	return typeToItemMap;
})();

export default class App extends PureComponent {
	state = {
		type: EnumType[0].value,
	}

	componentDidCatch(e){
		console.error(e);
	}

    render() {
		return (
			<Fragment>
				<div>
					<select onChange={(e) => this.setState({type: e.target.value})}>
						{
							EnumType.map(item => <option key={item.value} value={item.value}>{item.label}</option>)
						}
					</select>
				</div>

				<div style={{position: "relative"}}>
					{EnumTypeToItemMap[this.state.type].component()}
				</div>

			</Fragment>
        );
    }
}




