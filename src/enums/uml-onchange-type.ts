export enum UMLOnChangeType {
  // Emit on any change
  change = 'change',
  // Emit on classs delete
  delete = 'delete',
  // Emit on classs name change
  changeName = 'change:name',
  // Emit on property change
  changeProperty = 'change:property',
  // Emit on method change
  changeMethod = 'change:method',
  // Emit on position change
  changePosition = 'change:position',
  // Emit on link change
  changeLink = 'change:link'
}
