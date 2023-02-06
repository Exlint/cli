export interface ISelectItem {
	readonly label: string;
	readonly value: string;
}

export interface ISelectItemSelection extends ISelectItem {
	selected: boolean;
	isHighlighted: boolean;
}
