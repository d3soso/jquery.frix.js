/* =============================

        FRIX.js

    ===============

    サイドバーなどのブロック要素をスクロールに合わせて位置をFIXします。
    上にスクロールした時に固定されたサイドバーもすぐ上に戻るのが特徴です。

    @author webwedge http://webwedge.jp/
    @version 0.5
    @licensed MIT license

    2017/07/24 0.5.001
    2017/07/03 0.5
    2017/04/28 0.1


============================== */

(function($) {


    var __ary = []; // FRIX OBJECT CONTAINER
    var __decoy_classname = "frix-decoy"; // decoyにつけるclass


    $.fn.frix = function() {

        var _this = this;
        var _debug = false;

        $(document).ready(
            function() {
                _this.each(INIT);
                $(window).resize(RESIZE);
                RESIZE();
            }
        );

        function INIT() {

            if($(this).parent().css("position")==="static") $(this).parent().css("position", "relative");

            var decoy = __decoy.addDecoy($(this));
            $(this).addClass("frix");

            var obj = {
                // Elements
                target : $(this),
                decoy  : decoy,

                // Property
                active : true, // falseにするとfrixによるfixedを停止する
                flag : {
                    top : false,
                    bottom : false
                },
                top : 0, // css("top")の値を格納する
                last_scrollTop : 0, // 前のターンのscrollTopを格納

                // data属性によるオプション設定
                scrollContainer : (!$(this).data("frix-container")) ? null : $($(this).data("frix-container")),
                fixed_target : (!$(this).data("frix-fixed-target")) ? $(this).parent() : $($(this).data("frix-fixed-target")),
                minWidth : (!$(this).data("frix-min-width")) ? -1 : $(this).data("frix-min-width"),
                maxWidth : (!$(this).data("frix-max-width")) ? -1 : $(this).data("frix-max-width"),
                defaultMarginTop : (!$(this).data("frix-scroll-margin-top")) ? 0 : $(this).data("frix-scroll-margin-top"),

                // 状態
                status : ""

            }

            $(this).css("position", "absolute");
            $(this).css("top", __decoy.getDecoyOffset(obj).ptop);
            setPositionLeft(obj);

            getScrollContainer(obj).scroll(function() {
                SCROLL(obj);
            });

            ACTION(obj);

            __ary.push(obj);

            if(_debug) DEBUG();

        }

        function DEBUG() {
            $("body").append('<div id="frix-debug" class="frix-debug"><div class="frix-debug-inner"></div></div>');
            $("body").append('<div id="frix-debug2" class="frix-debug"><div class="frix-debug-inner"></div></div>');
            $(".frix-debug").css({
                position : "fixed",
                left : 0,
                top : 0,
                zIndex : 99999,
                background : "#000"
            })
            $("#frix-debug2").css({
                position : "fixed",
                left : 0,
                top : 202,
                zIndex : 99999,
                background : "#000"
            })
            $(".frix-debug-inner").css({
                width : 300,
                height: 200,
                padding : "10px",
                overflow: "auto"
            })
            $("#frix-debug2 .frix-debug-inner").css({
                color : "#fff",
                fontSize : "10px",
                lineHeight : "1.2em"
            })
        }

        function RESIZE() {

            for(var i=0; i<__ary.length; i++) {

                __ary[i].target.width( $(__ary[i].decoy).width() );
                // __ary[i].target.height( $(__ary[i].decoy).height() );
                setPositionLeft(__ary[i]);

                if(__ary[i].maxWidth < getScrollContainer(__ary[i]).width() && __ary[i].maxWidth >= 0) __ary[i].active = false;
                else if( __ary[i].minWidth > getScrollContainer(__ary[i]).width() &&  __ary[i].minWidth >= 0) __ary[i].active = false;
                else __ary[i].active = true;

                SCROLL(__ary[i]);

            }
        }

        function SCROLL(obj) {

            if(obj.active) {
                if(obj.decoy.css("display")=="none") obj.decoy.css("display", "block");
                ACTION(obj);
            }else {
                // frix()が動作していない時
                obj.decoy.css("display", "none");
                obj.target.css({
                    position : obj.decoy.css("position"),
                    top:0,
                    left:"initial"
                })
            }

        }

        /* =========================

            ACTION : Void

        ===========================*/

        function ACTION(obj) {

            var scrollTop = getScrollContainer(obj).scrollTop();
            obj.status = "";

            if(isShort(obj) && scrollTop >= getBottomY(obj) - obj.target.height() - obj.defaultMarginTop) {

                // =====================================================
                // scrollTop が scrollContainer.bottom より下になった時
                // かつtarget.heightがwindow^.heightより低い時
                // =====================================================

                obj.status = "Target.bottom below fixed_target.bottom // Target.height shorter than window.height";
                obj.flag.top = obj.flag.bottom = false;
                obj.top = obj.fixed_target.height() - obj.target.outerHeight() - parseInt(obj.target.css("margin-bottom"));

                obj.target.css({
                    position : "absolute",
                    top : obj.top
                })
                setPositionLeft(obj);

            }else if(!isShort(obj) && scrollTop >= getBottomY(obj) - getScrollContainer(obj).height()) {

                // =====================================================
                // scrollTop が scrollContainer.bottom より下になった時
                // =====================================================
                obj.status = "Target.bottom below fixed_target.bottom";
                obj.flag.top = obj.flag.bottom = false;

                if(isShort(obj) && scrollTop >= getBottomY(obj) - obj.target.height() - obj.defaultMarginTop) {
                    obj.status += " // Target.height shorter than window.height";
                    obj.top = obj.fixed_target.height() - obj.target.outerHeight() - parseInt(obj.target.css("margin-bottom"));
                }else {
                    obj.top = obj.fixed_target.height() - obj.target.outerHeight() - parseInt(obj.target.css("margin-bottom"));
                }

                if(obj.fixed_target!==obj.target.parent()) obj.top  += parseInt(obj.fixed_target.css("margin-top"));

                obj.target.css({
                    position : "absolute",
                    top : obj.top
                })
                setPositionLeft(obj);

            }else if(scrollTop < __decoy.getDecoyOffset(obj).vtop - obj.defaultMarginTop) {

                // =====================================================
                // スクロール量がdecoy.offset.topより上になった時
                // =====================================================
                obj.status = "Target.scrollTop above fixed_target.top";
                obj.status += '//vtop : ' + __decoy.getDecoyOffset(obj).vtop
                obj.flag.top = obj.flag.bottom = false;
                obj.top = __decoy.getDecoyOffset(obj).ptop;

                $(obj.target).css({
                    position : "absolute",
                    top : obj.top
                })

                setPositionLeft(obj);

            }else if(scrollTop > obj.last_scrollTop) {

                // =====================================================
                // scrollContainerの範囲内で下にスクロールしている時
                // =====================================================

                obj.status = "target scroll down";


                if(obj.flag.top && !isShort(obj)) {

                    // ***
                    // 上スクロールから下スクロールへ切り替えた
                    // ***

                    obj.status += ' / Changed scroll direction: up->down';
                    obj.flag.top = false;

                    obj.top = scrollTop - __decoy.getDecoyOffset(obj).vtop - obj.defaultMarginTop;

                    $(obj.target).css({
                        position : "absolute",
                        top : obj.top
                    })

                    setPositionLeft(obj);

                }else if(isShort(obj) && scrollTop > __decoy.getDecoyOffset(obj).vtop - obj.defaultMarginTop) {

                    // ***
                    // scrollTop が target.bottomより下になった
                    // かつdecoy.topがwindow^.heightより低い時
                    // ***

                    obj.status += ' /  Scrolltop below target.bottom // Target.height shorter than window.height';
                    obj.flag.bottom = true;

                    obj.top = obj.defaultMarginTop;

                    obj.target.css({
                        position : "fixed",
                        top : obj.top
                    })

                    setPositionLeft(obj);


                }else if(!obj.flag.bottom && scrollTop > obj.target.outerHeight() + __decoy.getDecoyOffset(obj).vtop + parseInt(obj.target.css("margin-bottom")) + obj.top - getScrollContainer(obj).height()) {

                    // console.log(__decoy.getDecoyOffset(obj));

                    // ***
                    // scrollTop が target.bottomより下になった
                    // ***
                    obj.status += ' / Scrolltop below target.bottom';
                    obj.flag.bottom = true;

                    obj.top = getScrollContainer(obj).height() - obj.target.outerHeight() - parseInt(obj.target.css("margin-bottom"));

                    obj.target.css({
                        position : "fixed",
                        top : obj.top
                    })

                    setPositionLeft(obj);

                }

            }else if(scrollTop < obj.last_scrollTop && scrollTop > __decoy.getDecoyOffset(obj).vtop) {

                // =====================================================
                // scrollContainerの範囲内で上にスクロールしている時
                // =====================================================

                obj.status = "target scroll up";

                if(obj.flag.bottom && !isShort(obj)) {

                    // ***
                    // 下スクロールから上スクロールへ切り替えた
                    // ***
                    obj.status += ' / Changed scroll direction: down->up obj.top:' + obj.top;
                    obj.flag.bottom = false;

                    // obj.top = scrollTop + obj.top - __decoy.getDecoyOffset(obj).vtop;
                    obj.top = scrollTop - obj.target.outerHeight() + getScrollContainer(obj).height() - parseInt(obj.target.css("margin-bottom")) - __decoy.getDecoyOffset(obj).vtop;

                    obj.status += '//' + obj.top;

                    obj.target.css({
                        position : "absolute",
                        top : obj.top
                    })

                    setPositionLeft(obj);

                }else if(!obj.flag.top && scrollTop < obj.top + __decoy.getDecoyOffset(obj).vtop) {

                    obj.flag.top = true;
                    obj.top = obj.defaultMarginTop;

                    obj.status += ' / [asdf]obj.top:' + obj.top;

                    obj.target.css({
                        position : "fixed",
                        top : obj.top
                    })

                    setPositionLeft(obj);

                }

            }

            obj.last_scrollTop = scrollTop;

            // console.log(obj.status)
            if(_debug) {
                var debug_content = '';
                debug_content += obj.status;
                $("#frix-debug .frix-debug-inner").prepend('<p style="font-size:9px;color:#fff;line-height:1.2em;">' + debug_content + '</p>');

                var debug2_content = '';
                debug2_content += 'scrollTop : ' + scrollTop + '<br>';
                debug2_content += 'getBottomY : ' + getBottomY(obj) + '<br>';
                debug2_content += '* : ' + (obj.target.outerHeight() + __decoy.getDecoyOffset(obj).vtop + parseInt(obj.target.css("margin-bottom")) + obj.top - getScrollContainer(obj).height()) + "<br>";
                debug2_content += 'vtop : ' + __decoy.getDecoyOffset(obj).vtop + "<br>";
                debug2_content += 'target.Height() : ' + obj.target.outerHeight() + "<br>";
                debug2_content += 'obj.top : ' + obj.top + "<br>";
                debug2_content += 'marginTop : ' + parseInt(obj.target.css("margin-bottom")) + "<br>";
                debug2_content += 'scrollContainer.H() : ' + getScrollContainer(obj).height() + "<br>";

                $("#frix-debug2 .frix-debug-inner").html(debug2_content);
            }

        }



        /* =========================

            setPositionLeft(obj) : Void
                obj : frix object

                frix対象のcss("left")を設定する

        ===========================*/

        function setPositionLeft(obj) {

            if(obj.target.css("position")==="absolute") {
                obj.target.css("left", __decoy.getDecoyOffset(obj).left - obj.target.parent().offset().left);
            }else if(obj.target.css("position")==="fixed") {
                obj.target.css("left", __decoy.getDecoyOffset(obj).left);
            }

        }

        /* =========================

            getBottomY(obj) : Number
                obj : frix object

                スクロール固定が停止するボトムラインの位置を取得

        ===========================*/

        // スクロール固定が停止するボトムラインの位置を取得
        function getBottomY(obj) {

            var top = obj.fixed_target.offset().top;

            if(obj.scrollContainer) top += obj.scrollContainer.scrollTop();

            return top + obj.fixed_target.height()
        }


        /* =========================

            getScrollContainer(obj) : jQueryObject

        ===========================*/

        function getScrollContainer(obj) {
            return (!obj.scrollContainer) ? $(window) : obj.scrollContainer;
        }

        /* =========================

            isShort(obj) :Boolean
            obj.target.height()がobj.scrollContainer.height()より短ければtrue

        ===========================*/

        function isShort(obj) {
            if(obj.target.height() < getScrollContainer(obj).height()) {
                return true;
            }else {
                return false;
            }
        }


    }

    /*=========================================================

        DECOY::

    =========================================================*/


    var DECOY = function() {

        /* =========================
            addDecoy(obj) : Object
                obj : frix対象エレメントのjQuery Object
        ===========================*/

        this.addDecoy = function(obj) {

            var id = 'frix-decoy-' + __ary.length;
            var tagName = obj.prop("tagName");
            obj.before('<' + tagName + ' id="' + id + '" class="' + __decoy_classname + '"></' + tagName + '>');
            var decoy = $("#" + id);

            // CSS
            if(obj.data("frix-width")) decoy.width(obj.data("frix-width"));
            else decoy.width(obj.width());

            if(obj.data("frix-height")) decoy.height(obj.data("frix-height"));
            else decoy.height(obj.height());

            obj.width( decoy.width() );
            // obj.height( decoy.height() );

            if(obj.css("position")!=="static") decoy.css("position", obj.css("position"));
            if(obj.css("left")!=="auto") decoy.css("left", obj.css("left"));
            if(obj.css("right")!=="auto") decoy.css("right", obj.css("right"));
            if(obj.css("top")!=="auto") decoy.css("top", obj.css("top"));
            if(obj.css("float")!=="none") decoy.css("float", obj.css("float"));
            if(parseInt(obj.css("margin-right"))!==0) decoy.css("margin-right", obj.css("margin-right"));
            if(parseInt(obj.css("margin-left"))!==0) decoy.css("margin-left", obj.css("margin-left"));
            if(parseInt(obj.css("margin-top"))!==0) decoy.css("margin-top", obj.css("margin-top"));
            if(parseInt(obj.css("margin-bottom"))!==0) decoy.css("margin-bottom", obj.css("margin-bottom"));
            if(parseInt(obj.css("padding-right"))!==0) decoy.css("padding-right", obj.css("padding-right"));
            if(parseInt(obj.css("padding-left"))!==0) decoy.css("padding-left", obj.css("padding-left"));
            if(parseInt(obj.css("padding-top"))!==0) decoy.css("padding-top", obj.css("padding-top"));
            if(parseInt(obj.css("padding-bottom"))!==0) decoy.css("padding-bottom", obj.css("padding-bottom"));
            return decoy;

        }


        /* =========================
            getDecoyOffset(obj) :void
                obj : flix object
        ===========================*/

        this.getDecoyOffset = function(obj) {

            if(obj.decoy.hasClass(__decoy_classname)) {

                var offset = obj.decoy.offset();
                var parent = obj.decoy.parent().offset();
                var vitual = {};

                if(obj.scrollContainer) {
                    virtual = {
                        top  : offset.top + obj.scrollContainer.scrollTop(),
                        left : offset.left + obj.scrollContainer.scrollLeft()
                    }
                }else {
                    virtual = {
                        top  : offset.top,
                        left : offset.left,
                    }
                }

                return  {
                    // decoyのサイト内におけるoffset
                    top  : offset.top,
                    left : offset.left,

                    // parent()基準の擬似的なoffset
                    ptop  : offset.top - parent.top - parseInt(obj.target.css("margin-top")),
                    pleft : offset.left - parent.left - parseInt(obj.target.css("margin-left")),

                    // scrollContainer基準の擬似的なoffset
                    vtop  : virtual.top,
                    vleft : virtual.left

                }

            }

        }

        /* =========================

            getScrollContainer(obj) : jQueryObject

        ===========================*/

        function getScrollContainer(obj) {
            return (!obj.scrollContainer) ? $(window) : obj.scrollContainer;
        }


    }


    var __decoy = new DECOY();

})($);
