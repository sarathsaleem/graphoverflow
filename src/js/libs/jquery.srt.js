/*
 * jQuery srt
 *
 * version 0.1 (November 28, 2008)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
/*
  usage:
    <video src="example.ogg" id="examplevideo" />
    <div class="srt" data-video="examplevideo" data-srt="example.srt"></div>

  jquery.srt.js will try to load subtitles in all elements with 'srt' class.
  'data-video' atribute is used to link to the related video,
  if no data-srt is provided, the contents of the div is parsed as srt.
*/

$(document).ready(function() {
  function toSeconds(t) {
    var s = 0.0
    if(t) {
      var p = t.split(':');
      for(i=0;i<p.length;i++)
        s = s * 60 + parseFloat(p[i].replace(',', '.'))
    }
    return s;
  }
  function strip(s) {
    return s.replace(/^\s+|\s+$/g,"");
  }
  function playSubtitles(subtitleElement) {
    var videoId = subtitleElement.attr('data-video');
    var srt = subtitleElement.text();
    subtitleElement.text('');
    srt = srt.replace(/\r\n|\r|\n/g, '\n')
    
    var subtitles = {};
    srt = strip(srt);
    var srt_ = srt.split('\n\n');
    for(s in srt_) {
        st = srt_[s].split('\n');
        if(st.length >=2) {
          n = st[0];
          i = strip(st[1].split(' --> ')[0]);
          o = strip(st[1].split(' --> ')[1]);
          t = st[2];
          if(st.length > 2) {
            for(j=3; j<st.length;j++)
              t += '\n'+st[j];
          }
          is = toSeconds(i);
          os = toSeconds(o);
          subtitles[is] = {i:i, o: o, t: t};
        }
    }
    var currentSubtitle = -1;
    var ival = setInterval(function() {
      var currentTime = document.getElementById(videoId).currentTime;
      var subtitle = -1;
      for(s in subtitles) {
        if(s > currentTime)
          break
        subtitle = s;
      }
      if(subtitle > 0) {
        if(subtitle != currentSubtitle) {
          subtitleElement.html(subtitles[subtitle].t);
          currentSubtitle=subtitle;
        } else if(subtitles[subtitle].o < currentTime) {
          subtitleElement.html('');
        }
      }
    }, 100);
  }
  $('.srt').each(function() {
    var subtitleElement = $(this);
    var videoId = subtitleElement.attr('data-video');
    if(!videoId) return;
    var srtUrl = subtitleElement.attr('data-srt');
    if(srtUrl) {
      $(this).load(srtUrl, function (responseText, textStatus, req) { playSubtitles(subtitleElement)})
    } else {
      playSubtitles(subtitleElement);
    }
  });

});

