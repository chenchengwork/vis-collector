import React, {useEffect, memo, useRef} from 'react';
import PropTypes from 'prop-types';
import "video.js/dist/video-js.css";
import videojs from "video.js";
import "videojs-flash";

const Video = memo(({url, options = {}, onError}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const player = videojs(videoRef.current,Object.assign({
            notSupportedMessage : '您的浏览器没有安装或开启Flash,戳我开启！',
            techOrder : ["flash"],
            autoplay : true,        // 自动播放
            flash: {
                swf: require("./video-js.swf")
            }
        }, options));

        if(onError) player.on("error", onError);

        return () => player.dispose();
    }, []);

    return (
        <video
            ref={videoRef}
            className="video-js vjs-default-skin vjs-big-play-centered"
            controls={true}
            width="640"
            height="360"
        >
            <source src={url}></source>

            <p className="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a web browser that
                <a href="http://videojs.com/html5-video-support/" target="_blank">
                    supports HTML5 video
                </a>
            </p>
        </video>
    )
});

Video.propTypes = {
    url: PropTypes.string.isRequired,
    options: PropTypes.object,
    onError: PropTypes.func
};

export default Video;
