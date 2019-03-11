import ThreeUtil from "../util/ThreeUtil";

/**
 * 加载字体
 * @return {Promise<void>}
 */
export default async function loadFont(scene){

    // 添加bmfont text
    const { textGeometry, textObject3D } = await ThreeUtil.mkBMFontText("中国");

    scene.add(textObject3D);
}
