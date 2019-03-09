import $ from 'jquery';
import R from 'ramda';
import {Expectation} from './expectation';
import {ActionUtil} from './action-util';
import {ElementUtil} from './element-util';

/**
 * Base DSL actions
 */
export class Action {
    /**
     * Clicks on element if it's clickable.
     * For example button can be disabled and click won't occur, you need to fetch that unaccepted behavior earlier.
     *
     * @param {Object} selector CSS Selector or Protractor Element
     */
    static click(selector) {
        Expectation.clickable(selector);
        return ActionUtil.expectExecutedAction(() => ElementUtil.elementFinder(selector).click());
    }

    /**
     * Clicks on element nevertheless if it's clickable or not. You can use it when
     * element is appeared only for some period of time and then disappears.
     * As e2e especially for IE is slow it can happen that Protractor can miss to click on that element during
     * that period of time. For example it can be used to close timed notification messages to proceed further,
     * as toastr might hide some elements which you want to click.
     *
     * @param {Object} selector CSS Selector or Protractor Element
     */
    static clickIfClickable(selector) {
        const finder = ElementUtil.elementFinder(selector);
        return expect(ActionUtil.execute(() => finder.click().then(R.T, R.T)));
    }

    /**
     * Executes native JavaScript function.
     *
     * @param {function} scriptFunction
     * @param {array} scriptArguments
     */
    static executeVoidScript(scriptFunction, ...scriptArguments) {
        const script = `(${scriptFunction}).apply(null, arguments);`;
        return ActionUtil.expectExecutedAction(() => browser.executeScript(script, ...scriptArguments));
    }

    /**
     * Focuses on a certain element.
     * Mainly has to be used for input fields.
     *
     * @param selector
     */
    static focus(selector) {
        Expectation.clickable(selector);
        return ActionUtil.expectExecutedAction(() => ElementUtil.elementFinder(selector).focus());
    }

    /**
     * Clicks on element by using native JavaScript execution.
     *
     * @param {Object} selector CSS Selector or Protractor Element
     */
    static jsClick(selector) {
        Expectation.present(selector);

        function clickIt() {
            arguments[0].click(); // eslint-disable-line prefer-rest-params
        }

        return Action.executeVoidScript(clickIt, ElementUtil.elementFinder(selector));
    }

    /**
     * Performs right click on a certain element.
     *
     * @param {Object} selector CSS Selector or Protractor Element
     */
    static rightClick(selector) {
        Expectation.clickable(selector);
        const code = (element) => {
            const elem = $(element)[0];
            const clientRect = elem.getBoundingClientRect();
            const coordinates = {pageX: clientRect.left, pageY: clientRect.top};
            const event = $.Event('contextmenu', coordinates); // eslint-disable-line new-cap
            $(element).trigger(event);
        };
        return Action.executeVoidScript(code, selector);
    }
}
