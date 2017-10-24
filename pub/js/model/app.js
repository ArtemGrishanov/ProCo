/**
 * Created by artyom.grishanov on 18.04.16.
 *
 * Основной объект управления приложением.
 *
 * Организация проекта простая, исходя из того что нет бекенда:
 * 1. На каждой странице инициализируем App, в котором собраны ключевые функции.
 * 1.1 FB апи.
 * 1.2 AWS апи.
 * 1.3 Функции локализации
 * 1.4 Множество UI обработчиков (применяются, понятно, только актуальные для страницы)
 * 2. В верстке каждой страницы: избыточность и повторы.
 *
 *
 * Дальше:
 * TODO вынести обработчики в view-контроллеры, в модели только работа с данными
 * TODO заменить на серверные шаблоны.
 * TODO авторизация: будет замена на свою куку вместо запроса к ФБ каждый раз
 *
 */

/**
 * AWS bucket доступен для работы
 * @type {string}
 */
var AWS_INIT_EVENT = 'AWS_INIT_EVENT';
/**
 *
 * @type {string}
 */
var FB_CONNECTED = 'FB_CONNECTED';
/**
 *
 * @type {string}
 */
var USER_DATA_RECEIVED = 'USER_DATA_RECEIVED';
///**
// * Был загружен список шаблонов пользователя
// * Например, можно начинать рисовать список шаблонов пользователя
// * @type {string}
// */
//var USER_TEMPLATES_LIST_RECEIVED = 'USER_TEMPLATES_LIST_RECEIVED';
///**
// * Вызывается на каждый загруженный шаблон индивидуально
// * @type {string}
// */
//var USER_TEMPLATES_LIST_RECEIVED = 'USER_TEMPLATE_INFO_RECEIVED';

var App = App || {};
(function(global){

    /**
     * id
     * name
     * first_name
     * gender
     * picture.data.url
     * email
     * etc..
     *
     * @type {object}
     */
    // var userData = null;
    /**
     * Статус который возвращает FB api (например connected - подключено)
     * @type {null}
     */
    // var responseStatus = null;
    /**
     * Был получен при авторизации в ФБ
     * @type {null}
     */
    var accessToken = null;
    /**
     * Время последнего создания бакета
     * Нужно для контроля при пересоздании бакетов, если сессия устарела
     * @type {null}
     */
    var loginTime = null;
    /**
     * Сохраненные проекты пользователя
     * Коллекция шаблонов пользователя
     */
    var userTemplateCollection = null;
    /**
     * апи для работы со aws хранилищем
     *
     * @type {object}
     */
    var bucket = null;
    var bucketForPublishedProjects = null;
    /**
     * Обработчики на события внутри App
     * Например, на инициализацию апи AWS
     *
     * @type {{function}}
     */
    var callbacks = {};
    /**
     * Мобильное устройство или нет
     * @type {undefined}
     */
    var isMob = undefined;
    /**
     * Были ли инициированы внешние сервисы из config.scripts
     * @type {boolean}
     */
    var scriptsWereInited = false;
    /**
     * Запрошен логин, пользователь кликнул на кнопку ФБ чтобы войти
     * @type {boolean}
     */
    var fbLoginRequestedInModal = false;
    /**
     *
     * @type {{}}
     */
    var dict = {
        'RU': {
            menu_gallery: 'Галерея шаблонов',
            how_it_works: 'Как это работает',
            faq: 'FAQ',
            contacts: 'Контакты',
            my_projects: 'Мои проекты',
            edit_template: 'Редактировать',
            clone_template: 'Клонировать',
            preview_template: 'Посмотреть',
            login_explanation: 'Войдите, чтобы получить больше возможностей',
            cat_all: 'Все',
            cat_quizes: 'Тесты',
            cat_quiz_desc: 'Тесты – один из самых распространенных видов игровых механик и выгодная альтернатива стандартным рекламным форматам. Создавайте красивые тесты, которыми люди будут делиться в социальных сетях.',
            cat_memory: 'Мемори',
            cat_memory_desc: 'Покажите связь предметов или явлений при помощи механики «Мемори». Каждая карточка имеет свою пару. Позвольте вашим читателям найти соответствие.',
            cat_pano: 'Панорамы',
            cat_fb_pano: 'Facebook панорамы',
            cat_fbpano_desc: 'Создавайте собственные экскурсии по интересным местам. Загружайте свои фотографии, добавляйте комментарии прямо на фото и публикуйте в виде панорамы 360° на Facebook.',
            cat_fbpano_desc_start: 'Для этого подойдет панорамная фотография, снятая на телефон, или изображение вытянутое по горизонтали. Рекомендуемый размер изображения – более 1600x1200 px',
            cat_pano_desc: 'С помощью панорам вы сможете совершить виртуальное путешествие по интересным местам. Загружайте фотографии, добавляйте метки и встраивайте панорамы на свой сайт.',
            cat_fbpano_header: 'Панорамы 360° для Facebook',
            cat_fbpano_header_start: 'Создайте панорамы, загрузив изображение',
            cat_pano_header: 'Панорамы',
            cat_timeline: 'Таймлайн',
            timelines: 'Таймлайны',
            cat_timeline_desc: 'Лучший способ наглядно показать хронологию событий: эволюцию технологий, последовательность политических решений или этапы развития вашей компании.',
            cat_zoommap: 'Zoom-карта',
            zoom_maps: 'Zoom-карты',
            cat_zoommap_desc: 'Отличная возможность акцентировать внимание на деталях: показать преимущества нового продукта, разобраться в нюансах живописного шедевра или представить новую коллекцию одежды.',
            select_template_to_start: 'Начните свой проект с выбора шаблона',
            correct_answer: 'Верный ответ',
            add_quiz_option: 'Добавить ответ',
            choose_image: 'Загрузить',
            save_template: 'Сохранить',
            preview: 'Просмотр',
            publish: 'Опубликовать',
            sign_in: 'Войти',
            sign_out: 'Выйти',
            back: 'Назад',
            enter_project_name: 'Введите имя проекта',
            choose: 'Выбрать',
            cancel: 'Отмена',
            select_dialog_ok: 'Добавить',
            new_slide: 'Новый слайд',
            please_wait: 'Пожалуйста, подождите...',
            ok: 'Ok',
            block_editor_on_mob: 'Вы находитесь на ознакомительной мобильной версии Testix.me.<br><br>Чтобы использовать конструктор Testix, перейдите на полную версию сайта.',
            choose_quiz_template: 'Выберите шаблон теста',
            mini_games_memory: 'Мини игры. Мемори',
            choose_pano_template: 'Выберите шаблон панорам',
            choose_memory_game: 'Выберите шаблон мемори',
            choose_fbpano_template: 'Выберите шаблон Facebook-панорамы',
            request_demo: 'Запросить демо',
            write_message: 'Написать сообщение',
            new_formats_request: 'Хотите заранее узнавать о новых механиках?<br>Напишите нам!',
            like_temp_create: 'Понравился шаблон? Создайте свой проект!',
            sharing_expl: 'Это изображение появится в социальной сети,<br>если пользователь поделится результатом ',
            return_autoimage: 'Вернуть автокартинку',
            upload: 'Загрузить',
            upload_image: 'Загрузить изображение',
            recom_im_size: 'Рекомендуемый размер изображения: ',
            cont: 'Продолжить',
            pano_perm_expl: 'Чтобы опубликовать панораму на Facebook,<br>нам потребуются от Вас дополнительные разрешения.',
            pano_perm_expl2: 'В появившемся окне Facebook нажмите "Разрешить"',
            proj_published: 'Ваш проект опубликован!',
            proj_link: 'Ссылка на проект',
            embed_code: 'Код для вставки на сайт или блог',
            publish_to_fb: 'Опубликовать в Facebook',
            copy: 'Копировать',
            show_proj: 'Посмотреть',
            have_problems: 'Не получается?',
            contact_us: 'Свяжитесь с нами',
            editor_mob_expl: 'Редактором удобнее пользоваться в полной версии сайта',
            editor_mob_expl2: 'Войдите для создания своего проекта',
            copied: 'Скопировано',
            choose_res: 'Выберите изображение',
            faq_header: 'Testix. Вопросы и ответы',
            faq_q1: 'Что такое Testix?',
            faq_a1: 'Testix – это онлайн сервис для создания интерактивного контента: тестов, мини-игр, интерактивных панорам и других нестандартных форматов. Создать свой проект можно за 5 минут: просто выберите один из шаблонов и добавьте ваш контент.',
            faq_q2: 'Как работает Testix?',
            faq_a2: 'Testix позволяет использовать преимущества интерактивного контента без навыков программирования и затрат на дизайн. В основе Testix – работа с готовыми шаблонами. Выберите наиболее подходящий из Галереи шаблонов и настройте его при помощи редактора Testix. Каждый шаблон – это готовый проект, который можно опубликовать. При публикации вы получите прямую ссылку на ваш проект на платформе Testix, а также код для вставки проекта на ваш сайт или в блог. Каждый проект уже содержит настраиваемые социальные кнопки Facebook и Вконтакте. Также вы можете собирать статистику при помощи счетчика Google Analytics.',
            faq_q3: 'Сколько стоит создать проект на Testix?',
            faq_a3: 'Это бесплатно. Прямо сейчас вам доступны все возможности Testix. Создавайте и публикуйте проекты без ограничений.',
            faq_q4: 'Какие интерактивные форматы можно создать с помощью Testix?',
            faq_a4: 'На данный момент доступно создание тестов, мини игр типа «Мемори» и панорам. В ближайшее время количество форматов будет увеличиваться.',
            faq_q5: 'Как создать свой тест на Testix?',
            faq_a5: 'Специально для вас мы создали подробную <a href="https://medium.com/@Testix.me/%D0%BA%D0%B0%D0%BA-%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%B8-%D0%BE%D0%BF%D1%83%D0%B1%D0%BB%D0%B8%D0%BA%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D1%81%D0%B2%D0%BE%D0%B9-%D1%82%D0%B5%D1%81%D1%82-%D1%81-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E-%D0%BF%D0%BB%D0%B0%D1%82%D1%84%D0%BE%D1%80%D0%BC%D1%8B-testix-fc02f5a962ae#.x6k96g62x" target="_blank" class="paper_link">пошаговую инструкцию</a> в нашем <a href="https://medium.com/@Testix.me" target="_blank" class="paper_link">блоге на Medium</a>',
            faq_q6: 'Какие инструменты используются для сбора статистики?',
            faq_a6: 'Для каждого проекта есть возможность подключить сервис Google Analytics.',
            faq_q7: 'Что делать, если мне нужна помощь в создании проекта?',
            faq_a7: 'Воспользуйтесь формой для связи в правой нижней части экрана. Наши специалисты ответят вам максимально оперативно и помогут решить любые вопросы, связанные с созданием и публикацией проекта.',
            faq_q8: 'Что делать, если мне нужны дополнительные возможности?',
            faq_a8: '<a href="mailto:info@testix.me" target="_top" class="paper_link">Напишите нам.</a> Мы обязательно придумаем лучшее решение вашей задачи.',
            hiw_header: 'Как работает Testix',
            hiw1: 'Это Семен, редактор<br>независимого интернет-издания',
            hiw2: 'В свете последних событий<br>нам срочно нужен спецпроект<br>с интерактивным контентом',
            hiw3: 'Начинать нужно было<br>неделю назад...',
            hiw4: 'Не теряйте<br>ни минуты',
            hiw5: 'Для издателей и авторов контента все возможности Testix доступны абсолютно <span class="hiw_selection">бесплатно</span>',
            hiw6: 'Используйте шаблоны',
            hiw7: 'Testix позволяет быстро создавать качественный интерактивный контент. Используйте шаблоны готовых проектов или создайте свой стиль в мощном редакторе.',
            hiw8: 'Готово? Публикуйте!',
            hiw9: 'Используйте готовый код для вставки на сайт или в блог. Добавляйте ссылки и кнопки социальных сетей Facebook и Вконтакте.',
            hiw10: 'Следите за результатами',
            hiw11: 'Получайте дополнительный социальный трафик. Отслеживайте переходы в Google Analytics',
            quizes_create_easely: 'Тесты. Создавать легко',
            quiz_index1: 'Создайте ваш тест за 5 минут. Выберите готовый шаблон и добавьте нужный котент. В вашем распоряжении мощный онлайн редактор и мгновенная публикация. Весь функционал доступен бесплатно.',
            create_quiz_free: 'Создать тест бесплатно',
            quiz_example: 'Посмотреть пример теста',
            mini_memory_create: 'Мини-игры. Мемори',
            memory_index1: 'Загрузите изображения в шаблон – и ваша собственная игра готова.<br><br>Игра «Мемори» позволяет проверить знания на соответствие изображений: например, какая марка автомобиля, за какой клуб играет футболист, в какой стране находится памятник архитектуры.',
            create_memory_free: 'Создать игру бесплатно',
            memory_example: 'Посмотреть пример игры',
            fbpano_create: 'Панорамы 360° для Facebook',
            fbpano_index1: 'Уникальный формат, позволяющий создать из обычной фотографии панораму 360°, подписать на ней любые объекты и опубликовать на Facebook. Создавайте собственные экскурсии по интересным местам – теперь в вашем распоряжении не просто панорамы, а возможность рассказать целую историю!',
            create_fbpano_free: 'Создать панораму бесплатно',
            fbpano_example: 'Пример панорамы',
            create_new_quiz: 'Создать новый тест',
            loading: 'Загрузка...',
            not_published: 'не опубликован',
            published: 'Опубликован',
            saved: 'Сохранено',
            error: 'Ошибка',
            unsaved_changes: 'У вас есть несохраненные изменения',
            select_template: 'Выберите шаблон для открытия',
            publish_error: 'Ошибка: Не удалось опубликовать проект.',
            hints: 'Подсказки',
            confirm_signout: 'Вы действительно хотите выйти?',

            signin_completed: 'Вход выполнен',
            error_incorrect_email: 'Некорректный email',
            error_no_username: 'Укажите email',
            error_no_password: 'Введите пароль',
            error_incorrect_username_or_password: 'Неверная пара email/пароль',
            error_password_attempts_exceeded: 'Слишком частый ввод пароля',
            error_user_not_exist: 'Пользователь не найден',
            error_user_not_confirmed: 'Пользователь не подтвердил регистрацию',
            error_signin: 'Не удалось войти'
        },
        'EN': {
            main_desc: 'Interactive content builder',
            special_what_is_it: 'What special project is?',
            business_solutions: 'Business solutions',
            spec_descr: 'Special projects are quizes, timelines, infografics and other formats. They can easily tell about complex topics, and using game ways frequently.',
            buss_descr: 'It\'s a good alternative to the standart ad formats. Create effective special projects to support your brand, which can be shared by people in social netwoks.',
            to_bloggers: 'Bloggers',
            to_media: 'Media',
            to_companies: 'Companies',
            surprise_them: 'Surprise your users offering them unusual formats',
            attract_new_readers: 'Use special projects to attract new followers',
            increase_reach: 'Increase your reach due to the viral effect of a special project',
            your_design: 'Special project with your design',
            choose_template: 'Select an appropriate template from the library and customize it according to your tasks.',
            spec_in_one_touch: 'Special projects with one touch',
            editor_desc: 'Convenient online Testix editor allows you to create high-quality quiz without programming skills,<br>and intuitive interface allows a designer to do without.',
            idea_publish: 'One step from idea to publication',
            create_in_blowser: 'Create special projects directly in your browser.<br>Get a link to your test or the code to insert into your website or blog.',
            learn_more: 'Want to know more about Testix? Write us!',
            send_message: 'Send message',
            watch_video: 'Video',
            create_spec: 'Create project for free',
            how_it_helps_to_business: 'Learn how special project<br>can support your business',
            menu_gallery: 'Template gallery',
            my_projects: 'My projects',
            how_it_works: 'How it works',
            contacts: 'Contacts',
            faq: 'FAQ',
            tests: 'Quizes',
            mini_games: 'Mini games',
            fbPanorama: 'Facebook 360°',
            design_your_test: 'Design your nice test based on our templates',
            format_card_test: 'Add your content - and quiz is ready! Set up social networks sharing and statistics.',
            design_your_minigame: 'Create your own games right in browser',
            format_card_minigame: 'Just pick the images and you will get a mini game «Memory»!',
            design_your_pano: 'Surprise your users offering them unique formats',
            format_card_fbpano: 'Upload photo, add marks and post to your Facebook timeline!',
            edit_template: 'Edit',
            clone_template: 'Clone',
            preview_template: 'Preview',
            login_explanation: 'Please, sign in to get more options',
            cat_all: 'All',
            cat_quizes: 'Quizes',
            cat_quiz_desc: 'Tests - one of the most common types of game mechanics and a excellent alternative to standard advertising formats. Create beautiful tests that people will share in social networks.',
            cat_memory: 'Memory games',
            cat_memory_desc: 'Show the connection of objects or phenomena with the help of Memory game. Each card has its own pair. Let your readers find a match.',
            cat_pano: 'Panoramas',
            cat_fb_pano: 'Facebook panoramas',
            cat_fbpano_desc: 'Create your own tours to interesting places. Upload your photos, add comments directly on the photo and publish panorama 360 to Facebook.',
            cat_fbpano_desc_start: 'You can use a panoramic photo taken on the phone, or a horizontal image. Recommended image size is more than 1600x1200 px',
            cat_pano_desc: 'With panoramas you can make a virtual trip to interesting places. Upload photos, add tags and embed panoramas on your site.',
            cat_fbpano_header: 'Facebook 360 photos',
            cat_fbpano_header_start: 'Upload an image and create panorama',
            cat_pano_header: 'Panoramas',
            cat_timeline: 'Timelines',
            timelines: 'Timelines',
            cat_timeline_desc: 'The best way to clearly show the chronology of events: the evolution of technology, policy decisions or your company growth.',
            cat_zoommap: 'Zoom-map',
            zoom_maps: 'Zoom-maps',
            cat_zoommap_desc: 'A great opportunity to focus on details: to show the advantages of a new product, to understand the nuances of the picture or present a new collection of clothes.',
            select_template_to_start: 'Select a template to start your project',
            correct_answer: 'Correct answer',
            add_quiz_option: 'Add option',
            choose_image: 'Choose image',
            save_template: 'Save',
            preview: 'Preview',
            publish: 'Publish',
            sign_in: 'Sign in',
            sign_out: 'Sign out',
            back: 'Back',
            enter_project_name: 'Input project name',
            choose: 'Choose',
            cancel: 'Cancel',
            select_dialog_ok: 'Ok',
            new_slide: 'New slide',
            please_wait: 'Please, wait...',
            ok: 'Ok',
            block_editor_on_mob: 'You are on the mobile version of Testix.me.<br><br>Please, use desktop to access the Testix editor.',
            choose_quiz_template: 'Choose quiz template',
            mini_games_memory: 'Mini games. Memory',
            choose_memory_game: 'Choose memory template',
            choose_pano_template: 'Choose panorama template',
            choose_fbpano_template: 'Choose panorama template',
            request_demo: 'Request demo',
            write_message: 'Write message',
            new_formats_request: 'Want to know in advance about new mechanics?<br>Contact us!',
            like_temp_create: 'Like the template? Create your project!',
            sharing_expl: 'This image will be posted in social network,<br>if user shares result ',
            return_autoimage: 'Return auto image',
            upload: 'Upload',
            upload_image: 'Upload image',
            recom_im_size: 'Recommended image size: ',
            cont: 'Continue',
            pano_perm_expl: 'We need extra permissions<br>to publish panorama to Facebook',
            pano_perm_expl2: 'Press "Allow" in Facebook window',
            proj_published: 'Your project was published!',
            proj_link: 'Project link',
            embed_code: 'Embed code for your site',
            publish_to_fb: 'Publish to Facebook',
            copy: 'Copy',
            show_proj: 'View',
            have_problems: 'Have problems?',
            contact_us: 'Contact us',
            editor_mob_expl: 'The editor is more convenient to use in the full version of the site',
            editor_mob_expl2: 'Sign in to use the editor',
            copied: 'Copied',
            choose_res: 'Choose image',
            faq_header: 'Testix. FAQ.',
            faq_q1: 'What is Testix?',
            faq_a1: 'Testix is an online service for creating interactive content: quizes, mini-games, interactive panoramas and other non-standard formats. Create your project in 5 minutes: just select one of the templates and add your content.',
            faq_q2: 'How does Testix work?',
            faq_a2: 'Testix allows you to take advantage of interactive content without programming and design skills. The main idea of Testix is ​​working with prepaired templates. Select the template that best fits the Template Gallery and configure it using the Testix editor. Each template is a ready-made project that can be published. After publishing, you will receive a direct link to your project on the Testix platform, and the code to insert the project on your website or blog. Each project already contains customizable Facebook and vk.com social buttons. Also, you can collect statistics using the Google Analytics counter.',
            faq_q3: 'How much does it cost to create a project on Testix?',
            faq_a3: 'It\'s free. Right now you can use all the features of Testix. Create and publish projects without restrictions.',
            faq_q4: 'What interactive formats can I create with Testix?',
            faq_a4: 'Now it is possible to create quizes, mini games like "Memori" and panoramas. In the near future, the number of formats will increase.',
            faq_q5: 'How to create your Testix quiz?',
            faq_a5: 'Especially for you, we created a detailed <a href = "https://medium.com/@Testix.me/%D0%BA%D0%B0%D0%BA-%D1%81%D0%BE%D0%B7% D0% B4% D0% B0% D1% 82% D1% 8C-% D0% B8-% D0% BE% D0% BF% D1% 83% D0% B1% D0% BB% D0% B8% D0% BA% D0% BE% D1% B2% D0% B0% D1% 82% D1% 8C-% D1% 81% D0% B2% D0% BE% D0% B9-% D1% 82% D0% B5% D1% 81% D1% 82-% D1% 81-% D0% BF% D0% BE% D0% BC% D0% BE% D1% 89% D1% 8C% D1% 8E-% D0% BF% D0% BB% D0% B0 % D1% 82% D1% 84% D0% BE% D1% 80% D0% BC% D1% 8B-testix-fc02f5a962ae # .x6k96g62x "step-by-step instruction" in the Our <a href="https://medium.com/@Testix.me" target="_blank" class="paper_link"> blog on Medium </a>',
            faq_q6: 'What tools are used to collect statistics?',
            faq_a6: 'You can link your project with the Google Analytics service.',
            faq_q7: 'I need help creating a project. What can I do?',
            faq_a7: 'Use the contact form on the bottom right of the screen. Our specialists will answer you as quickly as possible and help to resolve any issues related to the creation and publication of the project.',
            faq_q8: 'I need additional features. Can you help me?',
            faq_a8: '<a href="mailto:info@testix.me" target="_top" class="paper_link"> Write to us. </a> We will definitely come up with the best solution to your problem.',
            hiw_header: 'How Testix works',
            hiw1: 'This is Simon, editor of<br>an independent online media',
            hiw2: 'We urgently need a special<br>project with interactive content,<br>because of the recent events',
            hiw3: 'We had to start<br>a week ago ...',
            hiw4: 'Let\'s start!',
            hiw5: 'All Testix features are available absolutely <span class = "hiw_selection">free</span> for publishers and content authors.',
            hiw6: 'Use templates',
            hiw7: 'Testix allows you to quickly create high-quality interactive content. Use templates for finished projects or create your own style in a powerful editor.',
            hiw8: 'Ready? Publish!',
            hiw9: 'Use the ready code to embed project on the site or blog. Add links and buttons to Facebook or Vkontakte.',
            hiw10: 'Inspect the results',
            hiw11: 'Get additional social traffic. Track conversions in Google Analytics',
            quizes_create_easely: 'Quizes. Create easily',
            quiz_index1: 'Create your quiz in 5 minutes. Select the ready template and add your content. At your disposal is a powerful online editor and instant publishing. All features are available for free.',
            create_quiz_free: 'Create quiz for free',
            quiz_example: 'View quiz example',
            mini_memory_create: 'Mini-games. Memory',
            memory_index1: 'Upload images to the template - and your own game is ready.<br><br>The game "Memory" allows you to check the knowledge of the correspondence of images: for example, what brand of car, a football player and his club, in which country is an architectural monument.',
            create_memory_free: 'Create game fro free',
            memory_example: 'View game example',
            fbpano_create: 'Photos 360° for Facebook',
            fbpano_index1: 'A unique format that allows you to create a 360° panorama from a regular photo, sign any objects on it and publish it to Facebook. Create your own tours to interesting places - now you have the opportunity to tell the whole story!',
            create_fbpano_free: 'Create photo 360° for free',
            fbpano_example: 'Photo 360° example',
            create_new_quiz: 'Create new quiz',
            loading: 'Loading...',
            not_published: 'not published',
            published: 'Published',
            saved: 'Saved',
            error: 'Error',
            unsaved_changes: 'You have unsaved changes',
            select_template: 'You need select a template for editing',
            publish_error: 'Error: Could not publish project',
            hints: 'Hints',
            confirm_signout: 'Do you really want to sign out?',

            signin_completed: 'Sign in completed',
            error_incorrect_email: 'Incorrect email format',
            error_no_username: 'Enter email',
            error_no_password: 'Enter password',
            error_incorrect_username_or_password: 'Incorrect email or password',
            error_password_attempts_exceeded: 'Password attempts exceeded',
            error_user_not_exist: 'User does not exist',
            error_user_not_confirmed: 'User has not confirm email',
            error_signin: 'Can not enter'
        }
    },
    /**
     * Статус мобильного меню: открыт или закрыт
     * @type {boolean}
     */
    mobileMenuOpened = false,
    /**
     * Сериализованные данные приложения
     * Можно сохранить в куках некоторые данные, например выбранную локализацию
     */
    appState = null,
    /**
     * Текущий установленный язык
     * @type {string}
     */
    language = null;

    /**
     * Выполнить настройку локализации
     */
    function initLang() {
        // забрать тексты из верстки которые там стоят по умолчанию и сложить их в словарь
        grabLangFromHTMLAndPutToDict(config.common.langInHTMLfiles);

        // выставляем локализацию
        // гет-параметр - самый приоритетный фактор. На втором месте - сохраненный в куках выбор пользователя
        var lang = getQueryParams(document.location.search)[config.common.langParamName];
        if (!lang || dict.hasOwnProperty(lang) === false) {
            // пытаемся достать выбор пользоватея по поводу локализации сделанный ранее
            lang = appState.lang;
            if (!lang) {
                // по умолчанию, так как нет никаких признаков выбора локализации
                lang = config.common.defaultLang;
            }
        }
        setLang(lang);
    }

    /**
     * Забрать из верстки тексты и сложить в словарь
     * Уже существующие ключи в словаре являются более приоитетными.
     *
     * @param lang
     */
    function grabLangFromHTMLAndPutToDict(lang) {
        if (dict.hasOwnProperty(lang)) {
            var elements = $('.pts_string');
            for (var i = 0; i < elements.length; i++) {
                var classes = $(elements[i]).attr('class');
                var reg = /pts_([A-z0-9]+)/ig;
                var match = null;
                while (match = reg.exec(classes)) {
                    if (match[0] && match[1] && match[1] !== 'string')  {
                        var key = match[1];
                        if (dict[lang].hasOwnProperty(key) === false) {
                            dict[lang][key] = $('.pts_'+key).html();
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * Установить яык интерфейса
     * @param {string} lang
     */
    function setLang(lang) {
        if (dict.hasOwnProperty(lang)) {
            language = lang
            $('.js-lang').removeClass('__active');
            $('.js-lang[data-lang="'+language+'"]').addClass('__active');
            localize();
            // сохранять выбранную локаль в куках для следующего раза
            serializeAppState();
        }
    }

    /**
     * Вернуть идишку установленной локализации
     * @returns {string}
     */
    function getLang() {
        return language;
    }

    /**
     * Вернуть значение ключа для текущего языка
     * @param {string} key
     * @returns {string}
     */
    function getText(key) {
        if (typeof dict[getLang()][key] === 'string') {
            return dict[getLang()][key];
        }
        // пользователь увидит что ресурс не локализован
        return key;
    }

    /**
     * Локализовать в соответствии с текущим language фрагмент html
     *
     * @param {string | HTML} [html] если не указан, то локализуется вся страница
     */
    function localize(html) {
        html = html || $('body');
        if (typeof html === 'string') {
            //TODO
        }
        else {
            for (var key in dict[language]) {
                if (dict[language].hasOwnProperty(key)) {
                    $(html).find('.pts_'+key).html(dict[language][key]);
                }
            }
        }
    }

    function start() {
        appState = deseriaizeAppState() || {};
        if (isTouchMobile() === true) {
            document.documentElement.className += " touch";
        }
        else {
            document.documentElement.className += " no-touch";
        }
//        if (config.common.facebookAuthEnabled === true) {
//            initFB();
//        }
//        else {
            // если отключена авторизация через фб то пытаемся сразу встроить скрипты
            // иначе там будет проверка по ИД пользователя: нужно ли подключать статистику или нет
//            initScripts(); ??
//        }
        initUIHandlers();
        initLang();

        // атоматически при старте пытаемся возобновить предыдущую сессию
        Auth.addEventCallback(onAuthEvent);
        Auth.tryRestoreSession();
    }

    /**
     * Обработка событий из модуля авторизации
     *
     * @param {string} event
     * @param {object} data
     */
    function onAuthEvent(event, data) {
        switch(event) {
            case Auth.EVENT_AUTO_SIGNIN_FAILED: {
//                initScripts(); ??
                bucket = null;
                bucketForPublishedProjects = null;
                if (typeof callbacks[FB_CONNECTED] === 'function') {
                    callbacks[FB_CONNECTED]('not_authorized, unknown');
                    // todo change callback name
                }
                updateUI();
                break;
            }
            case Auth.EVENT_SIGNIN_SUCCESS: {
                if (config.common.awsEnabled === true && bucket === null && bucketForPublishedProjects === null) {
                    initAwsBuckets(Auth.getAuthToken());
                }
                // todo callbacks
                updateUI();
                break;
            }
            case Auth.EVENT_SIGNOUT: {
                updateUI();
                break;
            }
        }
    };

    /**
     * В зависимости от конфига добавить на страницу доп скрипты типа GA или плагинов для обратной связи
     */
    function initScripts(userId) {
        if (scriptsWereInited !== true) {
            // undefined or null returns '-1'
            if (config.common.excludeUsersFromStatistic.indexOf(userId)<0) {
                for (var key in config.scripts) {
                    if (config.scripts.hasOwnProperty(key)) {
                        var sc = config.scripts[key];
                        if (sc.enable === true) {
                            $('body').append(sc.code);
                        }
                    }
                }
            }
            scriptsWereInited = true;
        }
    }

    /**
     * Привязать стандартные обработчики событий в интерфейсе
     *
     * .js-logout
     * .js-show_login
     */
    function initUIHandlers() {
        $('#id-user_toolbar').off('click').click(function(event) {
            var e = $('#id-user_ctx_menu');
            if (e.css('display') === 'none') {
                e.show();
            }
            else {
                e.hide();
            }
            event.preventDefault();
            event.stopPropagation();
        });
        $(document).click(function() {
            $('#id-user_ctx_menu').hide();
        });
        $('.js-to_my_templates').click(onMyTemplates);
        $('.js-logout').click(onLogoutClick);
        $('.js-show_login').click(function(){
            Modal.showSignin();
        });
        $('.js-video').click(function() {
            $('#id-video').show();
            if (document.getElementById('id-videoplayer')) {
                // standar <video> tag controls
                document.getElementById('id-videoplayer').play();
            }
        });
        $('.js-video_close').click(function() {
            $('#id-video').hide();
            if (document.getElementById('id-videoplayer')) {
                // standar <video> tag controls
                document.getElementById('id-videoplayer').pause();
            }
        });
        $('.js-lang').click(function(e){
            var $e = $(e.currentTarget);
            setLang($e.attr('data-lang'));
        });
        $('.js-mob_menu_switcher').click(function(e) {
            toggleMobileMenu();
        });
    }

    function toggleMobileMenu(e) {
        mobileMenuOpened = !mobileMenuOpened;
        if (mobileMenuOpened === true) {
            $('.js-mob_menu_switcher').addClass('__opened');
            $('#id-mob_menu').show();
            $('#id-page_content').hide();
        }
        else {
            $('.js-mob_menu_switcher').removeClass('__opened');
            $('#id-mob_menu').hide();
            $('#id-page_content').show();
        }
    }

    /**
     * Инициализация js fb sdk
     */
//    function initFB() {
//        window.fbAsyncInit = function() {
//            FB.init({
//                appId      : config.common.facebookAppId,
//                cookie     : true,  // enable cookies to allow the server to access
//                // the session
//                xfbml      : true,  // parse social plugins on this page
//                version    : 'v2.5' // use graph api version 2.5
//            });
//            // Now that we've initialized the JavaScript SDK, we call
//            // FB.getLoginStatus().  This function gets the state of the
//            // person visiting this page and can return one of three states to
//            // the callback you provide.  They can be:
//            //
//            // 1. Logged into your app ('connected')
//            // 2. Logged into Facebook, but not your app ('not_authorized')
//            // 3. Not logged into Facebook and can't tell if they are logged into
//            //    your app or not.
//            //
//            // These three cases are handled in the callback function.
//            FB.getLoginStatus(function(response) {
//                // если приложение в тестовом режиме, то пользователь должен быть добавлен в приложение руками
//                // иначе никакого колбека не будет, ни с каким статусом
//                statusChangeCallback(response);
//            });
//        };
//        // Load the SDK asynchronously
//        (function(d, s, id) {
//            var js, fjs = d.getElementsByTagName(s)[0];
//            if (d.getElementById(id)) return;
//            js = d.createElement(s); js.id = id;
//            js.src = "//connect.facebook.net/en_US/sdk.js";
//            fjs.parentNode.insertBefore(js, fjs);
//        }(document, 'script', 'facebook-jssdk'));
//    }

    /**
     * Инициализация апи для работы с хранилищем Amazon
     * Должна проходить после успешной авторизации через фб, так как нужен user_id
     *
     * @param {string} token - fb access token, that was got after authorization
     */
    function initAwsBuckets(token) {
        if (config.common.awsEnabled === true) {
            AWS.config.region = config.common.awsRegion;
            bucket = new AWS.S3({
                params: {
                    Bucket: config.common.awsBucketName,
                    CacheControl: 'no-cache'
                }
            });
//            bucket.config.credentials = new AWS.WebIdentityCredentials({
//                //ProviderId: 'graph.facebook.com',
//                ProviderId: 'cognito-identity.amazonaws.com',
//                RoleArn: config.common.awsRoleArn,
//                WebIdentityToken: token
//            });

            bucketForPublishedProjects = new AWS.S3({
                params: {
                    Bucket: config.common.awsPublishedProjectsBucketName,
                    CacheControl: 'no-cache'
                }
            });
//            bucketForPublishedProjects.config.credentials = new AWS.WebIdentityCredentials({
//                //ProviderId: 'graph.facebook.com',
//                ProviderId: 'cognito-identity.amazonaws.com',
//                RoleArn: config.common.awsRoleArn,
//                WebIdentityToken: token
//            });

            if (typeof callbacks[AWS_INIT_EVENT] === 'function') {
                callbacks[AWS_INIT_EVENT]();
            }
        }
    }

    /**
     * Создать заново интерфейс для работы с s3, так как сессия может истечь при долгом простое
     * Будет получена ошибка IDPRejectedClaim: Missing credentials in config
     * Тогда нужно вызвать этот метод и попробовать снова
     */
    function relogin() {
        bucket = null;
        bucketForPublishedProjects = null;
        if (new Date().getTime() - loginTime < config.common.RELOGIN_DELAY) {
            // чтобы нельзя было слишком часто перелогиниваться
            return false;
        }
        // fb accessToken надо также пересоздать чтобы заново создать aws buckets
        requestLogin();
        return true;
    }

    /**
     * This is called with the results from from FB.getLoginStatus().
     *
     * @param response
     */
//    function statusChangeCallback(response) {
//        // The response object is returned with a status field that lets the
//        // app know the current login status of the person.
//        // Full docs on the response object can be found in the documentation
//        // for FB.getLoginStatus().
//        responseStatus = response.status;
//        if (response.status === 'connected') {
//            // событие: установлена свзяь с фб, пользователь вошел
//            if (typeof callbacks[FB_CONNECTED] === 'function') {
//                callbacks[FB_CONNECTED]('connected');
//            }
//            // Logged into your app and Facebook.
//            if (userData === null) {
//                getUserInfo();
//            }
//            accessToken = response.authResponse.accessToken;
//            // Первый раз должны проинициализировать апи для aws
//            if (config.common.awsEnabled === true && bucket === null && bucketForPublishedProjects === null) {
//                initAwsBuckets(accessToken);
//            }
//        } else {
//            //not_authorized, unknown
//            initScripts();
//            userData = null;
//            bucket = null;
//            bucketForPublishedProjects = null;
//            if (typeof callbacks[FB_CONNECTED] === 'function') {
//                callbacks[FB_CONNECTED]('not_authorized, unknown');
//            }
//        }
//        updateUI();
//    }

    /**
     * Запросить логин у FB апи
     *
     * @param {boolean} fromModal
     */
//    function requestLogin(fromModal) {
//        fbLoginRequestedInModal = fromModal;
//        if (fbLoginRequestedInModal === true) {
//            stat('Testix.me', 'First_Login_Click', 'Facebook_login');
//        }
//        if (FB) {
//            loginTime = new Date().getTime();
//            FB.login(function(response) {
//                statusChangeCallback(response);
//            }, {scope:'user_friends,email'});
//        }
//    }

    /**
     * Request basic info from fb api
     */
//    function getUserInfo() {
//        if (FB) {
//            userData = null;
//            FB.api('/me',
//                {
//                    fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,gender,hometown,link,location,middle_name,name,timezone,website,work"
//                },
//                function(response) {
//                    userData = response;
//                    initScripts(userData.id);
//                    updateUI();
//                    if (typeof callbacks[USER_DATA_RECEIVED] === 'function') {
//                        callbacks[USER_DATA_RECEIVED]('ok');
//                    }
//                    if (fbLoginRequestedInModal === true) {
//                        stat('Testix.me', 'First_Login_Completed', 'Facebook_login');
//                        fbLoginRequestedInModal = false;
//                    }
//                    else {
//                        stat('Testix.me', 'Auto_login', 'Facebook_login');
//                    }
//                    //getFriends();
//            });
//        }
//    }

    /**
     * Get friends
     */
//    function getFriends() {
//        if (FB) {
//            FB.api(userData.id+'/friends',
//                {fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,gender,hometown,link,location,middle_name,name,timezone,website,work"},
//                function(response) {
//                });
//        }
//    }

//    function onFBLoginClick() {
//        requestLogin(true);
//    }

    /**
     * Кликнули на кнопку разлогина
     */
    function onLogoutClick() {
        if (window.confirm(App.getText('confirm_signout'))) {
            Auth.signOut();
        }
//        if (FB) {
//            FB.logout(function(response) {
//                // Person is now logged out
//                statusChangeCallback(response);
//            });
//        }
    }

    /**
     * Переход в мои шаблоны
     */
    function onMyTemplates() {
        window.location.href = 'my_templates.html';
    }

    /**
     * Обновить станлартные компоненты UI на основе пользовательских данных
     * Реализуется поведение по умолчанию
     *
     * .js-profile_picture
     * .js-user_name
     * .js-authorization_status
     */
    function updateUI() {
        if (Auth.getUser()) {
            Modal.hideLogin();
            $('.js-show_login').hide();
            $('.js-user_ctx_menu').show().find('#id-user_ctx_menu').hide();
            //$('.js-profile_picture').show().empty().append('<img src="' + userData.picture.data.url + '"> ');
            $('.js-user_name').show().text(Auth.getUser().email);
            $('.js-authorization_status').text('Thanks for logging in, ' + Auth.getUser().email + '!');
        }
        else {
            $('.js-show_login').show();
            $('.js-user_ctx_menu').hide();
            $('.js-profile_picture').empty().hide();
            $('.js-user_name').hide().text('');
            $('.js-authorization_status').text('Not logged');
        }
    }

    /**
     *
     * TODO: Ограничение - один колбек на одно событие. В Engine.js уже есть такой паттерн, просто надо вынести в отдельный класс.
     *
     * @param event
     * @param callback
     */
    function on(event, callback) {
        callbacks[event] = callback;
    }

    /**
     * Запросить шаблоны пользователя
     *
     * @param {function} onTemplateListLoaded
     * @param {function} onTemplateInfoLoaded
     */
    function requestUserTemplates(onTemplateListLoaded, onTemplateInfoLoaded) {
        if (Auth.getUser() !== null) {
            userTemplateCollection = new TemplateCollection({
                // каталог с шаблонами который надо загружать
                folder: Auth.getUser().id+'/app'
            });
            userTemplateCollection.loadTemplateList(function() {
                if (onTemplateListLoaded) {
                    onTemplateListLoaded(userTemplateCollection.templates);
                }
                // небольшая пауза - даем отрисовать список шаблонов
                setTimeout(function(){
                    userTemplateCollection.loadTemplatesInfo(function(template) {
                        // получена информация по одному шаблоны
                        if (onTemplateInfoLoaded) {
                            onTemplateInfoLoaded(template);
                        }
                    });
                }, 200);
            });
        }
        else {
            App.showLogin();
        }
    }

    /**
     * Удалить шаблон с сервера и из коллекции локально
     *
     * @param {function} callback
     * @param {string} templateId
     */
    function deleteTemplate(callback, templateId) {
        //запрос на амазон на удаление
        //плюс локально удалить из коллекции
        if (userTemplateCollection) {
            userTemplateCollection.delete(function(result){
                callback(result);
            }, templateId);
        }
    }

    /**
     * Запуск редактора с параметрами
     *
     * @param param.appName
     * @param param.templateUrl
     * @param param.clone
     * @param param.getParams - дополнительные get параметры
     */
    function openEditor(param) {
        // доступен ли редактор для запуска или только по прямой ссылке
        if (config.common.editorIsUnderConstruction === false ||
            (userData !== null && config.common.editorIsUnderConstructionWhitelist.indexOf(userData.id) >= 0)) {
            if (isMobile() !== true) {
                var url = 'editor.html?';
                if (param.appName) {
                    url += 'app='+param.appName+'&';
                }
                else {
                    if (param.templateUrl) {
                        url += config.common.templateUrlParamName+'='+param.templateUrl+'&';
                    }
                    if (typeof param.clone === 'boolean') {
                        url += config.common.cloneParamName+'='+param.clone+'&';
                    }
                }
                if (param.getParams) {
                    // дополнительные гет параметры от шаблона, например appStorage=ref:strf для панорам
                    url += param.getParams+'&';
                }
                window.location.href = url;
            }
            else {
                // на мобе не запускаем редактор а показываем отдельный экран
                window.location.href = 'blockeditor.html';
            }
        }
        else {
            Modal.showMessage({text: 'Редактор пока что в разработке, напишите нам.'});
        }
    }

    /**
     * Программно открыть линк в новом окне
     *
     * @param {string} url
     */
    function openUrl(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

    /**
     * Проверка на мобильное устройство по юзер агенту
     * regexp from http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
     *
     * @returns {boolean}
     */
    function isMobile() {
        if (typeof isMob === 'boolean') {
            return isMob;
        }
        isMob = false;
        (function(a){if(/(android|bb\d+|meego|iPad|iPod|iPhone|Windows Phone|BlackBerry|webOS).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))){isMob = true;}})(navigator.userAgent||navigator.vendor||window.opera);
        return isMob;
    };

    /**
     * Устройство с редимом touch чтобы в некоторых местах по другому реализовать взаимодействие
     * @returns {boolean}
     */
    function isTouchMobile() {
        return ("ontouchstart" in document.documentElement) && isMobile()===true;
    }

    /**
     * Отправить событие в систему сбора статистики
     * В html уже включен код инициализации
     *
     * @param {string} category, например Videos
     * @param {string} action, например Play
     * @param {string} [label], например 'Fall Campaign' название клипа
     * @param {number} [value], например 10 - длительность
     */
    function stat(category, action, label, value) {
        var userId = (Auth.getUser()) ? Auth.getUser().id: null;
        if (window.ga && config.common.excludeUsersFromStatistic.indexOf(userId)<0) {
            var statData = {
                hitType: 'event',
                eventCategory: category,
                eventAction: action,
            };
            if (label) {
                statData.eventLabel = label;
            }
            if (value) {
                statData.eventValue = value
            }
            window.ga('send', statData);
        }
    };

    /**
     *
     * @returns {*}
     */
    function deseriaizeAppState() {
        try {
            var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)appState\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            var s = JSON.parse(cookieValue);
            // document.cookie = "appState=; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // пимер сброса после прочтения
            return s;
        }
        catch(e) {
            console.log(e.message);
        }
        return null;
    }

    /**
     *
     */
    function serializeAppState() {
        try {
            var s = {
                lang: language
            };
            var cookie = 'appState='+JSON.stringify(s)+'; expires=Fri, 31 Dec 2020 23:59:59 GMT';
            document.cookie = cookie;
        }
        catch(e) {
            console.log(e.message);
        }
    }

    // public methoods below
    global.start = start;
    // global.getUserAnonimId = getUserAnonimId;
    //global.getUserData = function() { return userData; };
    global.getAWSBucket = function() { return bucket; };
    global.getAWSBucketForPublishedProjects = function() { return bucketForPublishedProjects; };
    global.getDict = function() { return dict; };
    global.on = on;
//    global.requestLogin = requestLogin;
    global.openEditor = openEditor;
    global.openUrl = openUrl;
    global.relogin = relogin;
    global.isMobile = isMobile;
    global.isTouchMobile = isTouchMobile;
    global.stat = stat;
    global.setLang = setLang;
    global.getLang = getLang;
    global.localize = localize;
    global.getText = getText;

    // шаблоны. Получить
    global.getUserTemplates = function() { return (userTemplateCollection !== null) ? userTemplateCollection.templates: null; }
    // шаблоны. Запросить с колбеком
    global.requestUserTemplates = requestUserTemplates;
    global.deleteTemplate = deleteTemplate;
})(App);