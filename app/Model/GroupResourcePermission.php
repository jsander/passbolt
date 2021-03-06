<?php
/**
 * GroupResourcePermission Model
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
class GroupResourcePermission extends AppModel {

	public $useTable = "groups_resources_permissions";

	public $belongsTo = [
		'Group',
		'Resource',
		'Permission'
	];

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
			case 'viewByResource':
				$conditions = [
					'conditions' => [
						// not null permissions
						'GroupResourcePermission.permission_id !=' => null,
						// permissions relative to the target resource
						'GroupResourcePermission.resource_id' => $data['GroupResourcePermission']['resource_id'],
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
		$returnValue = ['fields' => []];
		switch ($case) {
			case 'viewByResource':
				$returnValue = [
					'fields' => ['group_id', 'resource_id', 'permission_id', 'permission_type'],
					'contain' => [
						'Permission' => [
							'fields' => ['id', 'type', 'aco', 'aco_foreign_key', 'aro', 'aro_foreign_key'],
							'PermissionType' => [
								'fields' => ['serial', 'name']
							],
							// Return the elements the permission has been defined for (group, category)
							'Group' => [
								'fields' => ['id', 'name']
							],
							'Resource' => [
								'fields' => ['id', 'name']
							],
							'Category' => [
								'fields' => ['id', 'name']
							]
						]
					]
				];
				break;
		}
		return $returnValue;
	}
}
