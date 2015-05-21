///<reference path="../typings/jquery/jquery.d.ts"/>
module Anterec {
    export class JsDragTable {
        private container: JQuery;
        private selectedHeader: JQuery;
        private draggableContainer: JQuery;
        private offsetX: Number = 5;
        private offsetY: Number = 5;

        constructor(target: JQuery) {
            this.container = target;
            this.rebind();
        }

        private rebind(): void {
            $(this.container).find("th").each((headerIndex: Number, header: Element) => {
                $(header).off("mousedown touchstart");
                $(header).off("mouseup touchend");
                $(header).on("mousedown touchstart", (event: Event) => { this.selectColumn($(header), event); });
                $(header).on("mouseup touchend", (event: Event) => { this.dropColumn($(header), event); });
            });
            $(this.container).on("mouseup touchend", () => { this.cancelColumn(); });
        }

        private selectColumn(header: JQuery, event: Event): void {
            event.preventDefault();
            var userEvent = new UserEvent(event);
            this.selectedHeader = header;
            var sourceIndex = this.selectedHeader.index() + 1;
            var cells: Element[] = [];

            $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each((cellIndex: Number, cell: Element) => {
                cells[cells.length] = cell;
            });

            this.draggableContainer = $("<div/>");
            this.draggableContainer.addClass("jsdragtable-contents");
            this.draggableContainer.css({ position: "absolute", left: userEvent.event.pageX + this.offsetX, top: userEvent.event.pageY + this.offsetY });

            var dragtable = this.createDraggableTable(header);

            $(cells).each((cellIndex: any, cell: Element) => {
                var tr = $("<tr/>");
                var td = $("<td/>");
                $(td).html($(cells[cellIndex]).html());
                $(tr).append(td);
                $(dragtable).find("tbody").append(tr);
            });

            this.draggableContainer.append(dragtable);
            $("body").append(this.draggableContainer);
            $(this.container).on("mousemove touchmove", (event: Event) => { this.moveColumn($(header), event); });
            $(".jsdragtable-contents").on("mouseup touchend", () => { this.cancelColumn(); });
        }

        private moveColumn(header: JQuery, event: Event): void {
            event.preventDefault();
            if (this.selectedHeader !== null) {
                var userEvent = new UserEvent(event);
                this.draggableContainer.css({ left: userEvent.event.pageX + this.offsetX, top: userEvent.event.pageY + this.offsetY });
            }
        }

        private dropColumn(header: JQuery, event: Event): void {
            event.preventDefault();
            var sourceIndex = this.selectedHeader.index() + 1;
            var targetIndex = $(event.target).index() + 1;
            var tableColumns = $(this.container).find("th").length;

            var userEvent = new UserEvent(event);
            if (userEvent.isTouchEvent) {
                header = $(document.elementFromPoint(userEvent.event.clientX, userEvent.event.clientY));
                targetIndex = $(header).prevAll().length + 1;
            }

            if (sourceIndex !== targetIndex) {
                var cells: Element[] = [];
                $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each((cellIndex: Number, cell: Element) => {
                    cells[cells.length] = cell;
                    $(cell).remove();
                    $(this.selectedHeader).remove();
                });

                if (targetIndex >= tableColumns) {
                    targetIndex = tableColumns - 1;
                    this.insertCells(cells, targetIndex, (cell: Element, element: JQuery) => {
                        $(cell).after(element);
                    });
                } else {
                    this.insertCells(cells, targetIndex, (cell: Element, element: JQuery) => {
                        $(cell).before(element);
                    });
                }

                $(this.container).off("mousemove touchmove");
                $(".jsdragtable-contents").remove();
                this.draggableContainer = null;
                this.selectedHeader = null;
                this.rebind();
            }
        }

        private cancelColumn(): void {
            $(this.container).off("mousemove touchmove");
            $(".jsdragtable-contents").remove();
            this.draggableContainer = null;
            this.selectedHeader = null;
        }

        private createDraggableTable(header: JQuery): JQuery {
            var table = $("<table/>");
            var thead = $("<thead/>");
            var tbody = $("<tbody/>");
            var tr = $("<tr/>");
            var th = $("<th/>");
            $(table).addClass($(this.container).attr("class"));
            $(table).width($(header).width());
            $(th).html($(header).html());
            $(tr).append(th);
            $(thead).append(tr);
            $(table).append(thead);
            $(table).append(tbody);
            return table;
        }

        private insertCells(cells: Element[], columnIndex: Number, callback: Function) {
            $(this.container).find("tr td:nth-child(" + columnIndex + ")").each((cellIndex: any, cell: Element) => {
                callback(cell, $(cells[cellIndex]));
            });
            $(this.container).find("th:nth-child(" + columnIndex + ")").each((cellIndex: any, cell: Element) => {
                callback(cell, $(this.selectedHeader));
            });
        }
    }

    class UserEvent {
        public event: Event;
        public isTouchEvent: Boolean;

        constructor(event: Event) {
            this.event = event;
            if (event.originalEvent && event.originalEvent.touches && event.originalEvent.changedTouches) {
                this.event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                this.isTouchEvent = true;
            }
        }
    }
}
jQuery.fn.extend({
    jsdragtable(): Anterec.JsDragTable  {
        return new Anterec.JsDragTable(this);
    }
});
