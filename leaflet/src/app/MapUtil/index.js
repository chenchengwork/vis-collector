import LeafletUtil from './LeafletUtil';

const L = LeafletUtil.G.L;

/**
 *  地图工具类
 */
export default class MapUtil extends LeafletUtil{
    static G = LeafletUtil.G;

    constructor(mapId, options = {}) {
        super(mapId, options);
    }
}
