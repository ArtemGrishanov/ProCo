/**
 * Created by artyom.grishanov on 30.11.17.
 */
function TriviaChart(container) {
    this.container = container;
    this.viewTempl = '<div class="rd"><div class="rd_notation_cnt"></div><div class="rd_line_cnt"></div></div>';
    this.circleTempl = '<div class="rd_line_item"><span class="rd_circle"></span><span class="rd_n">0</span></div>';
    this.gapTempl = '<div class="rd_line_item"><span class="rd_gap"></span></div>';
    this.labelTempl = '<div class="rd_notation_item"><span class="rd_notation_lbl"></span></div>';
    // ширина в которую необходимо уместить компонент
    this.totalWidth = 598;
    // размер кружка который находится внутри диапазона результата
    this.smallCircleWidth = 10;
    // размер кружочка, который обозначает конец диапазона результата
    this.bigCircleWidth = 10;
    // отступ слева но линии (у результата 0-баллов может не быть gap совсем, а только кружок)
    // в стилях в классе .rd_line_cnt
    this.lineCntPaddingLeft = 30;
    this.colorPalette = ['#f8e9a1','#24305e','#f76c6c','#a8d0e6','#374785'];
    this.colorIndex = Math.floor(Math.random() * 4);
}

TriviaChart.prototype.getNextColor = function() {
    this.colorIndex++;
    if (this.colorIndex >= this.colorPalette.length) {
        this.colorIndex = 0;
    }
    return this.colorPalette[this.colorIndex];
}

TriviaChart.prototype.draw = function(data) {
    this.$view = $(this.viewTempl);
    this.$view.width(this.totalWidth);
    $(this.container).append(this.$view);

    var actualResId = null;
    var gapsCount = data.length-1;
    var bigCirclesCount = this.getUnicResultsCount(data);
    var smallCirclesCount = data.length-bigCirclesCount;
    var gapWidth = Math.floor((this.totalWidth - this.lineCntPaddingLeft - bigCirclesCount*this.bigCircleWidth - smallCirclesCount*this.smallCircleWidth) / gapsCount);
    var actualColor = this.getNextColor();
    var widthOfActualResult = 0;

    for (var i = 0; i < data.length; i++) {
        var isBig = false;
        if (actualResId != data[i][1]) {
            // начать новый резалт
            actualResId = data[i][1];
            actualColor = this.getNextColor();
            if (i == 0) {
                widthOfActualResult = this.lineCntPaddingLeft
            }
            else {
                widthOfActualResult = 0;
            }
        }
        // сначала пробел отрисовать
        if (i > 0) {
            this.renderGap(actualColor, gapWidth);
        }
        // если этот результат последний в серии: следом идет другой резалт или конец данных
        isBig = (i+1 >= data.length || (i < data.length-1 && actualResId != data[i+1][1]));
        // теперь отрисовать текущий кружок с баллами
        this.renderCircle(actualColor, isBig, data[i][0]);

        widthOfActualResult += (i>0? gapWidth: 0) + (isBig===true? this.bigCircleWidth: this.smallCircleWidth);
        if (isBig === true) {
            this.renderLabel(actualColor, widthOfActualResult, actualResId);
        }
    }
}

TriviaChart.prototype.renderLabel = function(color, width, label) {
    var $l = $(this.labelTempl);
    $l.find('.rd_notation_lbl').html(label);
    $l.find('.rd_notation_lbl').css('background-color',color);
    $l.width(width);
    this.$view.find('.rd_notation_cnt').append($l);
}

TriviaChart.prototype.renderGap = function(color, gapWidth) {
    var $g = $(this.gapTempl);
    $g.find('.rd_gap').width(gapWidth);
    $g.find('.rd_gap').css('border-color',color);
    this.$view.find('.rd_line_cnt').append($g);
}

TriviaChart.prototype.renderCircle = function(color, isBig, num) {
    var $c = $(this.circleTempl);
    $c.find('.rd_n').text(num);
    if (isBig) {
        $c.find('.rd_circle').addClass('__big');
    }
    $c.find('.rd_circle').css('backgroundColor',color);
    this.$view.find('.rd_line_cnt').append($c);
}

TriviaChart.prototype.getUnicResultsCount = function(data) {
    var unic = [];
    for (var i = 0; i < data.length; i++) {
        if (unic.indexOf(data[i][1]) < 0) {
            unic.push(data[i][1]);
        }
    }
    return unic.length;
}