# Скелёт вёрстки (Stylus, PostCSS, Lost, Boy, ES6, Vueify)

## Установка

Клонируем репозиторий:

```sh
$ git clone git@github.com:Intraweb007/FrontendSkeleton.git .
```

Устанавливаем зависимости и `gulp` если необходимо:

```sh
$ npm install --global gulp
$ npm install
```

## Описание работы

### Конфиги

Все пути и настройки задач в файле `config/default.json`.

### Основные команды

Все команды можно увидеть в `gulpfile.js`.

* `gulp` или `gulp watch` — запуск `browserSync` с наблюдением за изменениями файлов и автоматическим запуском соответствующих задач.
**Обратите внимание** — запущенный `browserSync` не отслеживает изменения в файлах, которые созданы во время его работы. Поэтому нужно сначала создать файл (js/html/styl/vue) и затем запускать задачу.

* `gulp js:vendor:make` — сжатие и объединение в единый `dist/min/vendor.js` файлов указанных в конфиге `concatVendor.path`.
* `gulp sprite` — создание спрайтов.

### Поддерживаемые JS фичи

По умолчанию работает ES6, подключён Vueify (создание отдельных `.vue` компонентов в вебпак стиле), Browserify (можем использовать `require()`), генерируются SourceMaps.

### Создание спрайтов

При запуске команды по умолчанию используются спрайты с поддержкой ретины. Достаточно положить в папку `img/icons/` изображение в 1x `somename.png` и в 2x `somename-2x.png` и запустить команду `gulp sprite`.

Для использования полученных спрайтов в стилях используем функцию `retinaSprite()`. Например:

```
span
    retinaSprite($somename_group)
```

Название переменной складывается из `$` + название файла + `_group`. Спрайт автоматически будет переключаться на версию `2x` на ретина устройствах.

### Особенности подключения JS/CSS файлов плагинов

Допустим, нам понадобилось подключить плагин X, у него есть 1 JS файл и 1 CSS файл. Необходимо:

1. CSS файл скопировать в папку `src/css`. В названии первым символом желательно поставить `_` или любой другой символ (нужно для того чтобы стили плагина в резульзирующем файле были вначале с более низким приоритетом).
2. JS файл скопировать в `src/vendor` и указать путь к нему в файле конфига `config/default.json` (`concatVendor.path`), добавив в массив.
3. Запустить `gulp js:vendor:make`, `gulp css:minify`. Или запустить `gulp` и поменять любой css и js файлы.

## Под капотом:

Stylus: [Boy](https://github.com/corysimmons/boy), [Lost](https://github.com/corysimmons/lost), [Rupture](https://github.com/jenius/rupture), [Autoprefixer](https://github.com/postcss/autoprefixer), [Vueify](https://github.com/vuejs/vueify)

HTML File Template: [gulp-file-include](https://github.com/coderhaoxin/gulp-file-include)

Sprites: [Spritesmith](https://github.com/twolfson/gulp.spritesmith)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.