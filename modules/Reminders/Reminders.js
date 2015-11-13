/*********************************************************************************
 * SugarCRM Community Edition is a customer relationship management program developed by
 * SugarCRM, Inc. Copyright (C) 2004-2013 SugarCRM Inc.

 * SuiteCRM is an extension to SugarCRM Community Edition developed by Salesagility Ltd.
 * Copyright (C) 2011 - 2014 Salesagility Ltd.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation with the addition of the following permission added
 * to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED WORK
 * IN WHICH THE COPYRIGHT IS OWNED BY SUGARCRM, SUGARCRM DISCLAIMS THE WARRANTY
 * OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along with
 * this program; if not, see http://www.gnu.org/licenses or write to the Free
 * Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301 USA.
 *
 * You can contact SugarCRM, Inc. headquarters at 10050 North Wolfe Road,
 * SW2-130, Cupertino, CA 95014, USA. or at email address contact@sugarcrm.com.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU Affero General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "Powered by
 * SugarCRM" logo and "Supercharged by SuiteCRM" logo. If the display of the logos is not
 * reasonably feasible for  technical reasons, the Appropriate Legal Notices must
 * display the words  "Powered by SugarCRM" and "Supercharged by SuiteCRM".
 ********************************************************************************/

/**
 * Remainers handling
 * Use Calls/Meatings module EditView.
 * The Remainders need a Scheduler table.
 */
var Reminders = {
	
	// override this by user preferences on reminder init
	defaultValues: {
		popup: true,
		email: true,
		timer_popup: 1800,
        timer_email: 3600
	},

    // we have to disabled the reminders on details view - override this on initialization
    disabled: false,

    errors: [],

    addDefaultReminderInterval: null,

    getInviteeView: function(id, module, moduleId, relatedValue) {
        if(!id) id = '';
        // TODO: add a template for this
        if(!Reminders.disabled) {
            var inviteeView = '<!-- enabled --><li class="invitees_item"><button class="invitee_btn" data-invitee-id="' + id + '" data-id="' + moduleId + '" data-module="' + module + '" onclick="Reminders.onInviteeClick(this);"><img src=index.php?entryPoint=getImage&themeName=SuiteR+&imageName=' + module + '.gif"><span class="related-value">' + relatedValue + '</span></button></li>';
        }
        else {
            var inviteeView = '<!-- diabled --><li class="invitees_item"><button class="invitee_btn" data-invitee-id="' + id + '" data-id="' + moduleId + '" data-module="' + module + '" disabled="disabled"><img src=index.php?entryPoint=getImage&themeName=SuiteR+&imageName=' + module + '.gif"><span class="related-value">' + relatedValue + '</span></button></li>';
        }
        return inviteeView;
    },

    addAllInvitees: function(e) {
        var inviteesList = '';
        // this function need a scheduler table!
        $('table#schedulerTable tr.schedulerAttendeeRow').each(function(i,e){
            var dataModule = $(e).attr('data-module');
            var dataId = $(e).attr('data-id');
            var relatedValue = $(e).find('td[scope="row"]').first().text();
            inviteesList += Reminders.getInviteeView(false, dataModule, dataId, relatedValue);
        });
        $(e).find('.invitees_list').first().html(inviteesList);
    },

    addInvitees: function(e, invitees) {
        if(!e) e = document.getElementById('reminder_template');
        var inviteesList = '';
        $.each(invitees, function(i,e){
            inviteesList += Reminders.getInviteeView(e.id, e.module, e.module_id, e.value);
        });
        $(e).find('.invitees_list').first().html(inviteesList);
    },

    setCheckboxValue: function(sel, value) {
        if(!value || value === false || value === 0 || value === '0' || value === '' || (typeof value == 'string' && value.toLowerCase() === 'false') ) {
            value = false;
        }
        else {
            value = true;
        }
        sel.prop('checked', value);
        sel.attr('checked', value);
    },

    setSelectValue: function(sel, value) {
        sel.val(value);
        sel.find('option').prop('selected', false);
        sel.find('option[value="' + value + '"]').attr('selected', 'selected');
        sel.find('option[value="' + value + '"]').prop('selected', true);
    },

    setReminderPopupChkbox: function(e, value) {
        Reminders.setCheckboxValue($(e).find('.popup_chkbox'), value);
    },

    setReminderEmailChkbox: function(e, value) {
        Reminders.setCheckboxValue($(e).find('.email_chkbox'), value);
    },

    setPopupTimerSelectValue: function(e, value) {
        Reminders.setSelectValue($(e).find('.timer_sel_popup'), value);
    },

    setEmailTimerSelectValue: function(e, value) {
        Reminders.setSelectValue($(e).find('.timer_sel_email'), value);
    },

    addReminder: function(e, popup, email, timer_popup, timer_email, reminderId, invitees) {
        if(!reminderId) reminderId = '';
        Reminders.setReminderPopupChkbox($('#reminder_template'), popup);
        Reminders.setReminderEmailChkbox($('#reminder_template'), email);
        Reminders.setPopupTimerSelectValue($('#reminder_template'), timer_popup);
        Reminders.setEmailTimerSelectValue($('#reminder_template'), timer_email);
        if(!invitees) {
            Reminders.addAllInvitees($('#reminder_template'));
        }
        else {
            Reminders.addInvitees(e, invitees);
        }
        $('#reminder_view').append('<li class="reminder_item" data-reminder-id="' + reminderId + '">' + $('#reminder_template').html() + '</li>');
    },

    onAddClick: function(e){
        Reminders.addReminder(e, Reminders.defaultValues.popup, Reminders.defaultValues.email, Reminders.defaultValues.timer_popup, Reminders.defaultValues.timer_email);
        Reminders.createRemindersPostData();
    },
    onRemoveClick: function(e) {
        $(e).closest('.reminder_item').remove();
        Reminders.createRemindersPostData();
    },
    onAddAllClick: function(e) {
        Reminders.addAllInvitees($(e).closest('.reminder_item'));
        Reminders.createRemindersPostData();
    },
    onInviteeClick: function(e) {
        $(e).closest('.invitees_item').remove();
        Reminders.createRemindersPostData();
    },

    getInviteesData: function(e) {
        var ret = [];
        $(e).find('.invitee_btn').each(function(i,e){
            ret.push({
                id: $(e).attr('data-invitee-id'),
                module: $(e).attr('data-module'),
                module_id: $(e).attr('data-id')
            });
        });
        return ret;
    },

    createRemindersPostData: function() {
        // do not create post data if disabled and/or it is not an EditView!
        if(!Reminders.disabled) {
            var reminders = [];
            $('#reminder_view .reminder_item').each(function (i, e) {
                reminders.push({
                    id: $(e).attr('data-reminder-id'),
                    popup: $(e).find('.popup_chkbox').prop('checked'),
                    email: $(e).find('.email_chkbox').prop('checked'),
                    timer_popup: $(e).find('.timer_sel_popup').val(),
                    timer_email: $(e).find('.timer_sel_email').val(),
                    invitees: Reminders.getInviteesData(e)
                });
            });
            document.EditView.reminders_data.value = JSON.stringify(reminders);
            Reminders.isValid('EditView', 'reminders_data');
        }
    },

    init: function(data, defaultValues, disabled) {
        Reminders.disabled = disabled ? true : false;
        if(data) {
            $.each(data, function(i,e){
                Reminders.addReminder(false, e.popup, e.email, e.timer_popup, e.timer_email, e.id, e.invitees);
            });
        }
		if(defaultValues) {
			if(defaultValues.popup) Reminders.defaultValues.popup = defaultValues.popup;
			if(defaultValues.email) Reminders.defaultValues.email = defaultValues.email;
			if(defaultValues.timer_popup) Reminders.defaultValues.timer_popup = defaultValues.timer_popup;
			if(defaultValues.timer_email) Reminders.defaultValues.timer_email = defaultValues.timer_email;
		}

        // on edit view
        if(!Reminders.disabled) {
            // add validations on edit view
            addToValidateCallback('EditView', 'reminders_data', 'function', false, SUGAR.language.get('app_strings', 'ERR_A_REMINDER_IS_EMPTY_OR_INCORRECT'), function (formname, nameIndex) {
                return Reminders.isValid(formname, nameIndex);
            });
            // add one reminder by default into the edit view if we don't have any reminders
            Reminders.addDefaultReminderInterval = setInterval(function(){
                // we have to wait for the scheduler table loaded
                if($('#schedulerTable .schedulerAttendeeRow').length>0) {
                    clearInterval(Reminders.addDefaultReminderInterval);
                    Reminders.addReminder(null, Reminders.defaultValues.popup, Reminders.defaultValues.email, Reminders.defaultValues.timer_popup, Reminders.defaultValues.timer_email);
                    Reminders.createRemindersPostData();
                }
            }, 300);
        }

        Reminders.createRemindersPostData();
    },

    onPopupChkboxClick: function(e) {
        Reminders.createRemindersPostData();
    },

    onEmailChkboxClick: function(e) {
        Reminders.createRemindersPostData();
    },

    onPopupTimerSelChange: function(e) {
        Reminders.createRemindersPostData();
    },

    onEmailTimerSelChange: function(e) {
        Reminders.createRemindersPostData();
    },

    isValid:function (formname, nameIndex) {
        Reminders.clearErrors();
        try {
            var remindersData = JSON.parse(document[formname][nameIndex].value);
            $.each(remindersData, function(i,e){
                if(!e.popup && !e.email) {
                    Reminders.addError(e.id, SUGAR.language.get('app_strings', 'ERR_REMINDER_IS_NOT_SET_POPUP_OR_EMAIL'));
                    error = true;
                }
                if(e.invitees.length == 0) {
                    Reminders.addError(e.id, SUGAR.language.get('app_strings', 'ERR_NO_INVITEES_FOR_REMINDER'));
                }
            });
        }
        catch(e) {
            throw e;
        }

        Reminders.showErrors();

        return Reminders.getErrors().length > 0 ? false : true;
    },

    clearErrors: function() {
        Reminders.errors = [];
    },

    addError: function(id, msg) {
        Reminders.errors.push({'id':id, 'msg':msg});
    },

    getErrors: function() {
        return Reminders.errors;
    },

    showErrors: function() {
        $('.reminder_item').removeClass('reminder-error');
        $('.reminder_item .error-msg').html('');
        $.each(Reminders.getErrors(), function(i,err){
            var _err = err;
            $('.reminder_item').each(function(i,elem){
                if($(elem).attr('data-reminder-id')==_err.id) {
                    $(elem).find('.error-msg').html(_err.msg);
                    $(elem).addClass('reminder-error');
                }
            });
        });
    }

};
