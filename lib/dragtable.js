///<reference path="../typings/jquery/jquery.d.ts"/>
var Anterec;
(function (Anterec) {
    var DragTable = (function () {
        function DragTable(target) {
            this.offsetX = 5;
            this.offsetY = 5;
            this.container = target;
            this.rebind();
        }
        DragTable.prototype.rebind = function () {
            var _this = this;
            $(this.container).find("th").each(function (headerIndex, header) {
                $(header).off("mousedown touchstart");
                $(header).off("mouseup touchend");
                $(header).on("mousedown touchstart", function (event) {
                    _this.selectColumn($(header), event);
                });
                $(header).on("mouseup touchend", function () {
                    _this.dropColumn($(header));
                });
            });
            $(this.container).on("mouseup touchend", function () {
                _this.cancelColumn();
            });
        };

        DragTable.prototype.selectColumn = function (header, event) {
            var _this = this;
            this.selectedHeader = header;
            var sourceIndex = this.selectedHeader.index() + 1;
            var cells = [];

            $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each(function (cellIndex, cell) {
                cells[cells.length] = cell;
            });

            this.draggableContainer = $("<div/>");
            this.draggableContainer.addClass("dragtable-contents");
            this.draggableContainer.css({ position: "absolute", left: event.pageX + this.offsetX, top: event.pageY + this.offsetY });

            var dragtable = this.createDraggableTable(header);

            $(cells).each(function (cellIndex, cell) {
                var row = $("<tr/>");
                var content = $("<td/>");
                $(content).html($(cells[cellIndex]).html());
                $(row).append(content);
                $(dragtable).append(row);
            });

            this.draggableContainer.append(dragtable);
            $("body").append(this.draggableContainer);
            $(this.container).on("mousemove touchmove", function (event) {
                _this.moveColumn($(header), event);
            });
            $(".dragtable-contents").on("mouseup touchend", function () {
                _this.cancelColumn();
            });
        };

        DragTable.prototype.moveColumn = function (header, event) {
            if (this.selectedHeader !== null) {
                this.draggableContainer.css({ left: event.pageX + this.offsetX, top: event.pageY + this.offsetY });
            }
        };

        DragTable.prototype.dropColumn = function (header) {
            var _this = this;
            var sourceIndex = this.selectedHeader.index() + 1;
            var targetIndex = header.index() + 1;
            var tableColumns = $(this.container).find("th").length;

            if (sourceIndex !== targetIndex) {
                var cells = [];
                $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each(function (cellIndex, cell) {
                    cells[cells.length] = cell;
                    var row = $(cell).closest("tr");
                    $(cell).remove();
                    $(_this.selectedHeader).remove();
                });

                if (targetIndex >= tableColumns) {
                    targetIndex = tableColumns - 1;
                    this.insertCells(cells, targetIndex, function (cell, element) {
                        $(cell).after(element);
                    });
                } else {
                    this.insertCells(cells, targetIndex, function (cell, element) {
                        $(cell).before(element);
                    });
                }

                $(this.container).off("mousemove touchmove");
                $(".dragtable-contents").remove();
                this.draggableContainer = null;
                this.selectedHeader = null;
                this.rebind();
            }
        };

        DragTable.prototype.cancelColumn = function () {
            $(this.container).off("mousemove touchmove");
            $(".dragtable-contents").remove();
            this.draggableContainer = null;
            this.selectedHeader = null;
            this.rebind();
        };

        DragTable.prototype.createDraggableTable = function (header) {
            var dragtable = $("<table/>");
            var thead = $("<thead/>");
            var tbody = $("<tbody/>");
            var row = $("<tr/>");
            var content = $("<th/>");
            $(dragtable).addClass($(this.container).attr("class"));
            $(dragtable).width($(header).width());
            $(thead).html($(header).html());
            $(content).append(thead);
            $(row).append(content);
            $(tbody).append(row);
            $(dragtable).append(tbody);
            return dragtable;
        };

        DragTable.prototype.insertCells = function (cells, columnIndex, callback) {
            var _this = this;
            $(this.container).find("tr td:nth-child(" + columnIndex + ")").each(function (cellIndex, cell) {
                callback(cell, $(cells[cellIndex]));
            });
            $(this.container).find("th:nth-child(" + columnIndex + ")").each(function (cellIndex, cell) {
                callback(cell, $(_this.selectedHeader));
            });
        };
        return DragTable;
    })();
    Anterec.DragTable = DragTable;
})(Anterec || (Anterec = {}));
jQuery.fn.extend({
    dragtable: function () {
        return new Anterec.DragTable(this);
    }
});
