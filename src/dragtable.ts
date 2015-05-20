///<reference path="../typings/jquery/jquery.d.ts"/>
module Anterec {
    export class DragTable {
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
            this.selectedHeader = header;
            var sourceIndex = this.selectedHeader.index() + 1;
            var cells: Element[] = [];

            $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each((cellIndex: Number, cell: Element) => {
                cells[cells.length] = cell;
            });

            var userEvent = event;
            if (event.originalEvent && event.originalEvent.touches && event.originalEvent.changedTouches) {
                userEvent = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
            }

            this.draggableContainer = $("<div/>");
            this.draggableContainer.addClass("dragtable-contents");
            this.draggableContainer.css({ position: "absolute", left: userEvent.pageX + this.offsetX, top: userEvent.pageY + this.offsetY });

            var dragtable = this.createDraggableTable(header);

            $(cells).each((cellIndex: any, cell: Element) => {
                var row = $("<tr/>");
                var content = $("<td/>");
                $(content).html($(cells[cellIndex]).html());
                $(row).append(content);
                $(dragtable).append(row);
            });

            this.draggableContainer.append(dragtable);
            $("body").append(this.draggableContainer);
            $(this.container).on("mousemove touchmove", (event: Event) => { this.moveColumn($(header), event); });
            $(".dragtable-contents").on("mouseup touchend", () => { this.cancelColumn(); });
        }

        private moveColumn(header: JQuery, event: Event): void {
            event.preventDefault();
            if (this.selectedHeader !== null) {
                var userEvent = event;
                if (event.originalEvent && event.originalEvent.touches && event.originalEvent.changedTouches) {
                    userEvent = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                }

                this.draggableContainer.css({ left: userEvent.pageX + this.offsetX, top: userEvent.pageY + this.offsetY });
            }
        }

        private dropColumn(header: JQuery, event: Event): void {
            var sourceIndex = this.selectedHeader.index() + 1;
            var targetIndex = $(event.target).index() + 1;
            var tableColumns = $(this.container).find("th").length;

            var userEvent = event;
            if (event.originalEvent && event.originalEvent.touches && event.originalEvent.changedTouches) {
                userEvent = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
                header = $(document.elementFromPoint(userEvent.clientX, userEvent.clientY));
                targetIndex = $(header).prevAll().length + 1;
            }

            if (sourceIndex !== targetIndex) {
                var cells: Element[] = [];
                $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each((cellIndex: Number, cell: Element) => {
                    cells[cells.length] = cell;
                    var row = $(cell).closest("tr");
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
                $(".dragtable-contents").remove();
                this.draggableContainer = null;
                this.selectedHeader = null;
                this.rebind();
            }
        }

        private cancelColumn(): void {
            $(this.container).off("mousemove touchmove");
            $(".dragtable-contents").remove();
            this.draggableContainer = null;
            this.selectedHeader = null;
            this.rebind();
        }

        private createDraggableTable(header: JQuery): JQuery {
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
}
jQuery.fn.extend({
    dragtable(): Anterec.DragTable  {
        return new Anterec.DragTable(this);
    }
});
