<?php
/**
 * Category Resource Model
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

App::uses('Category', 'Model');
App::uses('Resource', 'Model');

class CategoryResource extends AppModel {

	public $useTable = "categories_resources";

	public $belongsTo = [
		'Category',
		'Resource'
	];

	public $actsAs = ['Trackable'];

/**
 * Get the validation rules upon context
 *
 * @param string $case (optional) The target validation case if any.
 * @return array cakephp validation rules
 */
	public static function getValidationRules($case = 'default') {
		$default = [
			'category_id' => [
				'uuid' => [
					'rule' => 'uuid',
					'required' => true,
					'allowEmpty' => false,
					'message' => __('UUID must be in correct format')
				],
				'exist' => [
					'rule' => ['validateExists', 'category_id', 'Category'],
					'message' => __('The category provided does not exist')
				]
			],
			'resource_id' => [
				'uuid' => [
					'rule' => 'uuid',
					'required' => true,
					'allowEmpty' => false,
					'message' => __('UUID must be in correct format')
				],
				'exist' => [
					'rule' => ['validateExists', 'resource_id', 'Resource'],
					'message' => __('The resource provided does not exist')
				],
				'uniqueCombi' => [
					'rule' => ['uniqueCombi', null],
					'message' => __('The CategoryResource entered is a duplicate')
				]
			]
		];
		switch ($case) {
			default:
			case 'default' :
				$rules = $default;
		}
		return $rules;
	}

/**
 * Check if a category with same id exists
 *
 * @param bool $check
 * @return bool
 */
	public function uniqueCombi($check = false) {
		$cr = $this->data['CategoryResource'];
		$combi = [
			'CategoryResource.category_id' => $cr['category_id'],
			'CategoryResource.resource_id' => $cr['resource_id']
		];

		return $this->isUnique($combi, false);
	}

/**
 * Return the find conditions to be used for a given context.
 *
 * @param null|string $case The target case.
 * @param null|string $role The user role.
 * @param null|array $data (optional) Optional data to build the find conditions.
 * @return array
 */
	public static function getFindConditions($case = 'view', $role = Role::USER, $data = null) {
		$conditions = [];
		switch ($case) {
			case 'add':
				$conditions = [];
				break;
			case 'view':
				$conditions = [
					'conditions' => [
						'CategoryResource.id' => $data['CategoryResource.id']
					]
				];
				break;
			default:
				$conditions = [
					'conditions' => []
				];
		}
		return $conditions;
	}

/**
 * Return the list of field to fetch for given context
 *
 * @param string $case context ex: login, activation
 * @return $condition array
 */
	public static function getFindFields($case = 'view', $role = Role::USER) {
		switch ($case) {
			case 'view':
			case 'add':
			case 'edit':
				$fields = [
					'fields' => [
						'id',
						'category_id',
						'resource_id'
					]
				];
				break;
			case 'delete':
				$fields = [];
				break;
			default:
				$fields = [
					'fields' => []
				];
				break;
		}
		return $fields;
	}
}
