/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets: true, $, window, navigator , clearInterval , setInterval, d3*/
require.config({
    paths: {
        TweenMax: 'libs/TweenMax',
        ScrollMagic: 'libs/ScrollMagic',
        "ScrollMagic.debug": 'libs/debug.addIndicators'
    }
});
define(['libs/ScrollMagic', 'libs/TweenMax'], function (ScrollMagic) {

    "use strict";

    function render(data, canvas) {


        // init controller
        var controller = new ScrollMagic.Controller();

        // build tween
        var tween = TweenMax.to("#target", 1, { rotation: 360, ease: Linear.easeNone });

        // build scene
        var scene = new ScrollMagic.Scene({ triggerElement: "#trigger", duration: 500 })
            .setTween(tween)
            //.setPin("#target", { pushFollowers: false })
            // .addIndicators() // add indicators (requires plugin)
            .addTo(controller);

    }
    return render;


    //     <form class="move">
    //         <fieldset id="options">
    //             <legend>Options</legend>
    //             <div title="default: 0">
    //                 <label for="duration">duration</label>
    //                 <div class="slider liveupdate"></div>
    //                 <input type="text" id="duration" size="3" value="" min="0" max="600" step="1">
    // 		</div>
    //                 <div title="default: 0">
    //                     <label for="offset">offset</label>
    //                     <div class="slider liveupdate"></div>
    //                     <input type="text" id="offset" size="3" value="" min="-300" max="300" step="1">
    // 		</div>
    //                     <div title="default: null">
    //                         <label for="triggerElement">triggerElement</label>
    //                         <input type="text" id="triggerElement" value="">
    //                             <button name="triggerElement" value="0">update</button>
    // 		</div>
    //                         <div title="default: &quot;onCenter&quot; == 0.5">
    //                             <label for="triggerHook">triggerHook</label>
    //                             <div class="slider liveupdate"></div>
    //                             <input type="text" id="triggerHook" size="3" value="" min="0" max="1" step="0.01">
    // 		</div>
    //                             <div title="default: &quot;onCenter&quot; == 0.5">
    //                                 <label></label>
    //                                 <button name="triggerHook" value="0">onLeave</button>
    //                                 <button name="triggerHook" value="0.5">onCenter</button>
    //                                 <button name="triggerHook" value="1">onEnter</button>
    //                             </div>
    //                             <div title="default: true">
    //                                 <label for="reverse">reverse</label>
    //                                 <input type="checkbox" id="reverse" value="1">
    // 		</div>
    //                                 <div title="default: false">
    //                                     <label for="tweenChanges">tweenChanges</label>
    //                                     <input type="checkbox" id="tweenChanges" value="1">
    // 		</div>
    // 	</fieldset>
    //                                 <fieldset id="actions">
    //                                     <legend>Actions</legend>
    //                                     <div>
    //                                         <label for="enabled">Scene enabled</label>
    //                                         <input type="checkbox" id="enabled" value="1" checked="">
    // 		</div>
    //                                         <div>
    //                                             <label for="tween">do tween</label>
    //                                             <input type="checkbox" id="tween" value="1" checked="">
    // 		</div>
    //                                             <div>
    //                                                 <label for="pin">do pin</label>
    //                                                 <input type="checkbox" id="pin" value="1" checked="">
    // 		</div>
    // 	</fieldset>
    // </form>
    //                                         <div class="spacer s2"></div>
    //                                         <div id="trigger" class="spacer s0"></div>
    //                                         <div id="target" class="box1 blue">
    //                                             <p>I feel dizzy.</p>
    //                                             <a href="#" class="viewsource">view source</a>
    //                                         </div>
    //                                         <div class="spacer s3"></div>
    //                                         <script>
    //                                             $(function () { // wait for document ready
    // 		// init controller
    // 		var controller = new ScrollMagic.Controller();

    // 		// build tween
    // 		var tween = TweenMax.to("#target", 1, {rotation: 360, ease: Linear.easeNone});

    // 		// build scene
    // 		var scene = new ScrollMagic.Scene({triggerElement: "#trigger", duration: 300})
    // 						.setTween(tween)
    // 						.setPin("#target", {pushFollowers: false})
    // 						.addIndicators() // add indicators (requires plugin)
    // 						.addTo(controller);

    // 		// init options
    // 		$("input#duration").val(scene.duration());
    // 		$("input#offset").val(scene.offset());
    // 		$("input#triggerElement").val("#" + scene.triggerElement().getAttribute("id"));
    // 		$("input#triggerHook").val(scene.triggerHook());
    // 		$("input#reverse").prop("checked", scene.reverse());
    // 		$("input#tweenChanges").prop("checked", scene.tweenChanges());

    // 		$("div.slider+input").change(); // trigger change to init sliders.

    // 		// form actions
    // 		// update on change
    // 		$("form #options input:not(#triggerElement)").on("change", function (e) {
    // 			var
    //                                             val = $(this).is("[type=checkbox]") ? $(this).prop("checked") : $(this).val(),
    // 				property = $(this).attr("id");
    // 			scene[property](val);
    // 		});
    // 		// actions
    // 		$("form #actions input[type=checkbox]").on("change", function (e) {
    // 			var
    //                                             active = $(this).prop("checked"),
    // 				type = $(this).attr("id");
    // 			if (type == "tween") {
    // 				if (active) {
    //                                                 scene.setTween(tween);
    //                                             } else {
    //                                                 scene.removeTween(true);
    //                                             }
    // 			} else if (type == "pin") {
    // 				if (active) {
    //                                                 scene.setPin("#target", { pushFollowers: false });
    //                                             } else {
    //                                                 scene.removePin(true);
    //                                             }
    // 			} else if (type == "enabled") {
    //                                                 scene.enabled(active);
    //                                             }
    // 		});
    // 		// update triggerElement
    // 		$("form #options button[name=triggerElement]").on("click", function (e) {
    //                                                 e.preventDefault();
    //                                             var
    // 				selector = $.trim($("input#triggerElement").val());
    // 			if (selector === "") {
    //                                                 scene.triggerElement(null);
    //                                             } else if ($(selector).length > 0) {
    //                                                 scene.triggerElement(selector);
    //                                             } else {
    //                                                 alert("No element was found using the selector \"" + selector + "\".");
    //                                             $("input#triggerElement").val("");
    // 				scene.triggerElement(null);
    // 			}
    // 		});
    // 		// triggerHook Buttons
    // 		$("form #options button[name=triggerHook]").on("click", function (e) {
    //                                                 e.preventDefault();
    //                                             $("input#triggerHook")
    // 				.val($(this).val())
    // 				.change();

    // 		});
    // 	});
    // </script>

});
