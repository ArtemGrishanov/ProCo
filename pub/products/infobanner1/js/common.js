(function(){
    "use strict";

    var states = [
        {
            "id" : "sights",
            "name" : "Достопримечательности",
            "slogan" : "Достопримечательности,<br> которыми восхищаются:"
        },
        {
            "id" : "holidays",
            "name" : "Праздники и традиции",
            "slogan" : "Национальный праздники,<br> которые отмечают:"
        },
        {
            "id" : "sport",
            "name" : "Спортивные достижения",
            "slogan" : "Спортивные успехи,<br> которыми гордятся"
        },
        {
            "id" : "food",
            "name" : "Традиционная кухня",
            "slogan" : "Традиционные рецепты,<br> по которым готовят:"
        },
        {
            "id" : "dress",
            "name" : "Национальный костюм",
            "slogan" : "Традиционная одежда,<br> которую носят:"
        }
    ];


    var $wrapper = $('.wrapper'),
        $container = $('.container'),
        $slogan = $('.slogan'),
        $nav = $('.nav'),
        $currentNav = $('.nav_tx'),
        $navItems = $nav.find('.nav_i'),
        CSS_MENU_ACTIVE = "__show"
        ;

    initState();
    filterMenu();

    $(document)

        //
        // navigation

        .on('click', '.nav_ac, .nav_tx', function(){
            $nav.toggleClass(CSS_MENU_ACTIVE);
        })

        .on('click', '.nav_i', function(){

            // change current state name
            var nextState = $(this).data('nav');
            $currentNav
                .data('nav', nextState)
                .text(getNavigationName(nextState));

            // hide menu
            $nav.removeClass(CSS_MENU_ACTIVE);
            filterMenu();

            // change state and slogan
            $wrapper.attr('class', 'wrapper __' + nextState);
            $slogan.html(getSloganTxt(nextState));
        })

        //
        // buttons

        .on('mouseover', '.nation_i', function(){
            var nation = $(this).data('nation');
            $container.addClass("__" + nation);
        })
        .on('mouseleave', '.nation_i', function(){
            $container.attr('class', 'container');
        })
    ;

    function initState() {
        var countOfStates = states.length,
            today = new Date().getDate(),
            promoDay;

        // т.к. getDate возвращает 0 для Sunday, 1 - Monday and etc
        today = (today === 0) ? 7 : today;
        promoDay = today % countOfStates - 1;


        // Заполним для текущего стейта навзание,
        $currentNav
            .data('nav', states[promoDay].id)
            .html(states[promoDay].name);

        // слоган,
        $slogan.html(states[promoDay].slogan);

        // и зальем всё
        $wrapper.addClass('__' + states[promoDay].id);
    }

    function filterMenu(){
        var currentState = $currentNav.data('nav');
        var menuToRender = $navItems.filter(function(index, element){
            return $(element).data('nav') !== currentState;
        });

        $('.nav_cnt').html(menuToRender);
    }

    function getSloganTxt(stateId) {
        for (var i = 0, len = states.length; i < len; i++) {
            if (states[i].id === stateId) {
                return states[i].slogan;
            }
        }
    }

    function getNavigationName(stateId) {
        for (var i = 0, len = states.length; i < len; i++) {
            if (states[i].id === stateId) {
                return states[i].name;
            }
        }
    }

})();