import 'mad/form/form';
//import 'app/component/secret_strength';
import 'app/form/secret/create';
import 'app/view/template/form/resource/create.ejs!';

passbolt.form.resource = passbolt.form.resource || {};

/**
 * @inherits {mad.Form}
 * @parent index
 *
 * @constructor
 * Instanciate a Resource Create Form Controller
 *
 * @param {HTMLElement} element the element this instance operates on.
 * @param {Object} [options] option values for the controller.  These get added to
 * this.options and merged with defaults static variable
 * @return {passbolt.form.resource.Create}
 */
var Create = passbolt.form.resource.Create = mad.Form.extend('passbolt.form.resource.Create', /** @static */ {

	defaults: {
		templateBased: true,
		secretField: null,
		// @todo should be dynamic functions of creation or update
		action: 'create',
		secretsForms: [],
		resource: null,
		templateUri: 'app/view/template/form/resource/create.ejs'
	}

}, /** @prototype */ {

	/**
	 * Before render.
	 */
	beforeRender: function() {
		this._super();
		this.setViewData('resource', this.options.data);
	},

	/**
	 * After start hook.
	 * Initialize the form elements.
	 * @see {mad.Component}
	 */
	afterStart: function () {
		var self = this;
		// temporary for update demonstration
		this.options.data.Resource = this.options.data.Resource || {};

		// Add category id hidden field
		this.addElement(
			new mad.form.Textbox($('#js_field_category_id'), {
				modelReference: 'passbolt.model.Resource.Category.id',
				validate: false
			}).start()
		);
		// Add resource name field
		this.addElement(
			new mad.form.Textbox($('#js_field_name'), {
				modelReference: 'passbolt.model.Resource.name'
			}).start(),
			new mad.form.Feedback($('#js_field_name_feedback'), {}).start()
		);
		// Add resource uri field
		this.addElement(
			new mad.form.Textbox($('#js_field_uri'), {
				modelReference: 'passbolt.model.Resource.uri'
			}).start(),
			new mad.form.Feedback($('#js_field_uri_feedback'), {}).start()
		);
		// Add resource username field
		this.addElement(
			new mad.form.Textbox($('#js_field_username'), {
				modelReference: 'passbolt.model.Resource.username'
			}).start(),
			new mad.form.Feedback($('#js_field_username_feedback'), {}).start()
		);
		// Add secrets forms.
		// @todo Check if this section regarding secrects is still useful.
		can.each(this.options.data.Secret, function (secret, i) {
			var form = new passbolt.form.secret.Create('#js_secret_edit_' + i, {
				data: secret,
				secret_i: i
			});
			form.start();
			form.load(secret);
			self.options.secretsForms.push(form);
		});
		// Add resource description field
		this.addElement(
			new mad.form.Textbox($('#js_field_description'), {
				modelReference: 'passbolt.model.Resource.description'
			}).start(),
			new mad.form.Feedback($('#js_field_description_feedback'), {}).start()
		);

		// If an instance of resource has been given, load it.
		if (this.options.data != null) {
			this.load (this.options.data);
		}

		// Notify the plugin that the resource is ready to be edited.
		mad.bus.trigger('passbolt.plugin.resource_edition');

		// Force focus on first element.
		setTimeout(function() {
			self.setInitialFocus();
		}, 100);
	},

	/**
	 * Set initial focus on the name field.
	 *
	 * If field is populated, then also select the content.
	 */
	setInitialFocus: function() {
		var initialFocusEl = $('#js_field_name');
		initialFocusEl.focus();
		if (initialFocusEl.val() != '') {
			initialFocusEl.select();
		}
	},

	/**
	 * @See parent:: submit();
	 */
	' submit': function (el, ev) {
		ev.preventDefault();

		// Form data are valid
		if (this.validate()) {
			var usersIds = [];

			if (this.options.action == 'edit') {
				// Get the users to encrypt the resource for.
				// @todo #security move that checking into the plugin.
				passbolt.model.Permission.findAll({
					'aco': this.options.data.constructor.shortName,
					'aco_foreign_key': this.options.data.id
				}, function (permissions, response, request) {
					permissions.each(function(permission, i) {
						usersIds.push(permission.aro_foreign_key);
					});
					// ask the plugin to encrypt the secrets.
					// When the secrets are encrypted the addon will send back the event secret_edition_secret_encrypted.
					mad.bus.trigger('passbolt.secret_edition.encrypt', usersIds);
				});
			} else {
				usersIds.push(mad.Config.read('user.id'));
				// ask the plugin to encrypt the secrets.
				// When the secrets are encrypted the addon will send back the event secret_edition_secret_encrypted.
				mad.bus.trigger('passbolt.secret_edition.encrypt', usersIds);
			}
		}
		else {
			// Data are not valid
			// if an error callback is given, call it
			if (this.options.callbacks.error) {
				this.options.callbacks.error();
			}
		}
	},

	/**
	 * Listen when the plugin has encrypted the secrets.
	 */
	'{mad.bus.element} secret_edition_secret_encrypted': function(el, ev, armoreds) {
		var data = this.getData();
		data['passbolt.model.Resource'].Secret = [];

		for (var userId in armoreds) {
			data['passbolt.model.Resource'].Secret.push({
				'user_id': userId,
				'data': armoreds[userId]
			});
		}

		// if a submit callback is given, call it
		if (this.options.callbacks.submit) {
			this.options.callbacks.submit(data);
		}
	},

	/**
	 * Listen when the plugin observed a change on the password.
	 */
	'{mad.bus.element} secret_edition_secret_changed': function(el, ev, armoreds) {
		this.element.trigger('changed', 'secret');
	},

	/* ************************************************************** */
	/* KEYBOARDS EVENTS */
	/* ************************************************************** */

	/**
	 * Listen when a tab key is pressed inside the username field.
	 * @param el
	 * @param ev
	 */
	'#js_field_username keydown': function(el, ev) {
		var code = ev.keyCode || ev.which;
		if (code == '9') {
			// Put focus on secret field (in plugin).
			mad.bus.trigger('passbolt.secret.focus');
		}
	},

	/**
	 * Listen when a tab key is pressed inside the description field.
	 * @param el
	 * @param ev
	 */
	'#js_field_description keydown': function(el, ev) {
		var code = ev.keyCode || ev.which;
		if (code == '9' && ev.shiftKey) {
			// Put focus on secret field (in plugin).
			mad.bus.trigger('passbolt.secret.focus');
		}
	},

	/**
	 * Listen when tab key is pressed inside secret field.
	 * (secret field is provided by plugin)
	 * @param el
	 * @param ev
	 */
	'{mad.bus.element} secret_tab_pressed': function(el, ev) {
		// Put focus on description field.
		$('#js_field_description').focus();
	},

	/**
	 * Listen when backtab key is pressed inside secret field.
	 * (secret field is provided by plugin)
	 * @param el
	 * @param ev
	 */
	'{mad.bus.element} secret_backtab_pressed': function(el, ev) {
		// Put focus on username field.
		$('#js_field_username').focus();
	}
});

export default Create;