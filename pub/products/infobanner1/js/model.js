/**
 * Created by alex on 29.10.15.
 */

/**
 * Декларативная модель, которая может быть "выполнена" на движке.
 * Модель - неотъемлемая часть прдукта (product)
 * Такая структура позволяет две важные вещи:
 * 1) описать логику
 * 2) хранить данные
 *
 * Следствия:
 * 1) К ней можно привязать настройки (settings), другими словами сделать редактор
 * 2) Данные можно также изменять через настройки
 *
 *
 */


var entities = [
    {
        id: 'nav',
        htmlId: 'nav',
        visible: {value:true,setting:'YesNo'},
        type: 'menu', // это тип компонента??
        items: [
            {
                id: 'item1',
                text: {value:'достопримечательности',setting:'TextInput'}
            },
            {
                id: 'item2',
                text: {value:'национальный костюм',setting:'TextInput'}
            }
        ]
    },
    {
        // id внутри модели и html-id - это одно и то же (пока)
        id: 'wrapper',
        htmlId: 'wrapper',
        type: 'back' // это тип компонента??
    },
    {
        id: 'container',
        htmlId: 'container',
        type: 'back' // это тип компонента??
    },
    {
        id: 'logo',
        htmlId: 'logo'
    },
    {
        id: 'slogan',
        htmlId: 'slogan',
        type: 'label' // это тип компонента??
    },
    {
        /**
         * Это группа. Логическое объединение однотипных элементов
         * Группа позволяет регулировать их численность. Например, минимально и максимальное количество ответов в опросе.
         */
        id: 'buttons',
        name: 'Кнопки',
        group: true,
        minItems: 0,
        /**
         * Максимальное количество итемов в группе. Тут от верстки зависит.
         */
        maxItems: 8,
        items: [
            {
                id: 'btn1',
                type: 'button',
                text: {value:'Черкесы',value:'TextInput'},
                link: {value:'https://ok.ru',setting:'LinkInput'}
            },
            {
                id: 'btn2',
                type: 'button',
                text: {value:'Русские',setting:'TextInput'},
                link: {value:'https://vk.ru'}
            }
        ]
    }
];

// Вопрос: а добавить новый state как?

/**
 * State - это группа каких-то свойтв и данных объекта.
 * Преимущество в том, что оно может быть установлено разом.
 *
 */
var states = [
    //
    // Изменение состояний экрана через переключение пунктов меню
    //
    {
        id: 'sights',
        name: 'Про достопримечательности',
        entities: [
            {
                id: 'slogan',
                text: {value:'Достопримечательности,\nкоторыми восхищаются:',setting:'TextInput'},
                // какие то данные устанавливаются?
                data: {value:'some_data'}
            },
            {
                id: 'logo',
                css: {value:'backgroundImage:url("i/logo-sights.png")',setting:'ImageSelect'}
            },
            {
                id: 'wrapper',
                css: {value:'backgroundColor:#49a154',setting:'ColorSelect'},
                data: {value:'sss13344'}
            }
        ],
        trigger: '#item1:click'
    },
    {
        id: 'dress',
        name: 'Про одежду',
        entities: [
            {
                id: 'slogan',
                text: {value:'Традиционная одежда,\nкоторую носят:'},
                // какие то данные устанавливаются?
                data: {value:'any_data_123'}
            },
            {
                id: 'logo',
                css: {value:'backgroundImage:url("i/logo-dress.png")'}
            },
            {
                id: 'wrapper',
                css: {value:'backgroundColor:#598dba'},
                data: {value:'qwerty'}
            },
            {
                id: 'nav',
                visible: {value:false}
            }
        ],
        trigger: '#item2:click'
    }

    //
    // Наведения на кнопки
    //
//    {
//        trigger: '#btn2:mouseover',
//        entities: [{
//                id: 'container',
//                css: {value:'backgroundColor:#9a2424',setting:'ColorSelect'}
//        }]
//    },
//    {
//        // как к этому привязать настроцки?
//        trigger: '#btn1:mouseover',
//        entities: [{
//            id: 'container',
//            css: {value:'backgroundColor:#e5c558',setting:'ColorSelect'}
//        }]
//    }
];