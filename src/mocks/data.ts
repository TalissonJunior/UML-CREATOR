import { UML } from '../models/uml';

export const mockData = [
	{
		key: 1,
		name: 'BankAccount',
		properties: [
			{
				name: 'Owner',
				type: 'String',
				visibility: 'public'
			},
			{
				name: 'Balance',
				type: 'Currency',
				visibility: 'public'
			}
		],
		methods: [
			{
				name: 'Deposit',
				visibility: 'public',
				type: 'void',
				parameters: [
					{
						name: 'amount',
						type: 'Currency'
					}
				]
			}
		],
		position: {
			x: 10,
			y: 10
		}
	}
] as Array<UML>;
