import LeafletUtil from './LeafletUtil';

/**
 *  地图工具类
 */
export default class MapUtil extends LeafletUtil{
    static G = LeafletUtil.G;

    constructor(mapId, options = {}) {
        super(mapId, options);
    }
}
