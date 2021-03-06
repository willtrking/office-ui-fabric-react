import * as React from 'react';
import { Image } from '../../Image';
import { Icon, IIconProps } from '../../Icon';
import { IChoiceGroupOption, IChoiceGroupProps } from './ChoiceGroup.Props';
import {
  css,
  getId,
  BaseComponent
} from '../../Utilities';
import './ChoiceGroup.scss';

export interface IChoiceGroupState {
  keyChecked: string;

  /** Is true when the control has focus. */
  keyFocused?: string;
}

export class ChoiceGroup extends BaseComponent<IChoiceGroupProps, IChoiceGroupState> {
  public static defaultProps = {
    options: []
  };

  private _id: string;
  private _labelId: string;
  private _inputElement: HTMLInputElement;

  constructor(props: IChoiceGroupProps, ) {
    super(props, { ['onChanged']: 'onChange' });

    this.state = {
      keyChecked: this._getKeyChecked(props.options),
      keyFocused: undefined
    };

    this._id = getId('ChoiceGroup');
    this._labelId = getId('ChoiceGroupLabel');
  }

  public componentWillReceiveProps(newProps: IChoiceGroupProps) {
    const newKeyChecked: string = this._getKeyChecked(newProps.options);
    const oldKeyCheched: string = this._getKeyChecked(this.props.options);

    if (newKeyChecked !== oldKeyCheched) {
      this.setState({
        keyChecked: newKeyChecked,
      });
    }
  }

  public render() {
    let { label, options, className, required } = this.props;
    let { keyChecked, keyFocused } = this.state;

    const titleClassName = css('ms-Label', className, {
      'is-required': required
    });

    return (
      // Need to assign role application on containing div because JAWS doesnt call OnKeyDown without this role
      <div role='application' className={ className }>
        <div
          className='ms-ChoiceFieldGroup'
          role='radiogroup'
          aria-labelledby={ this.props.label ? this._id + '-label' : '' }
        >
          <div className='ms-ChoiceFieldGroup-title'>
            { this.props.label ? <label className={ titleClassName } id={ this._id + '-label' }>{ label }</label> : null }
          </div>

          { options.map((option) => (
            <div
              key={ option.key }
              className={ css('ms-ChoiceField', {
                'ms-ChoiceField--image': !!option.imageSrc || !!option.iconProps,
                'is-inFocus': option.key === keyFocused
              })
              }
            >
              <input
                ref={ (c): HTMLInputElement => this._inputElement = c }
                id={ `${this._id}-${option.key}` }
                className='ms-ChoiceField-input'
                type='radio'
                name={ this.props.name || this._id }
                disabled={ option.isDisabled || option.disabled || this.props.disabled }
                checked={ option.key === keyChecked }
                onChange={ this._onChange.bind(this, option) }
                onFocus={ this._onFocus.bind(this, option) }
                onBlur={ this._onBlur.bind(this, option) }
                aria-labelledby={ `${this._labelId}-${option.key}` }
              />
              { this._renderField(option) }
            </div>
          )) }
        </div>
      </div>
    );
  }

  public focus() {
    if (this._inputElement) {
      this._inputElement.focus();
    }
  }

  private _onFocus(option: IChoiceGroupOption, ev: React.FocusEvent<HTMLElement>): void {
    this.setState({
      keyFocused: option.key,
      keyChecked: this.state.keyChecked
    });
  }

  private _onBlur(option: IChoiceGroupOption, ev: React.FocusEvent<HTMLElement>): void {
    this.setState({
      keyFocused: undefined,
      keyChecked: this.state.keyChecked
    });
  }

  private _renderField(option: IChoiceGroupOption) {
    const { keyChecked } = this.state;
    let isDisabled = option.isDisabled || option.disabled || this.props.disabled;

    return (
      <label
        htmlFor={ this._id + '-' + option.key }
        className={ css({
          'ms-ChoiceField-field--image': !!option.imageSrc || !!option.iconProps,
          'ms-ChoiceField-field': !option.imageSrc && !option.iconProps,
          'is-checked': option.key === keyChecked,
          'is-disabled': isDisabled
        }) }
      >
        {
          option.imageSrc
            ? <div className='ms-ChoiceField-innerField'>
              <div className={ css('ms-ChoiceField-imageWrapper', { 'is-hidden': option.key === keyChecked }) }>
                <Image
                  src={ option.imageSrc }
                  width={ option.imageSize.width }
                  height={ option.imageSize.height }
                />
              </div>
              <div className={ css('ms-ChoiceField-imageWrapper', { 'is-hidden': option.key !== keyChecked }) }>
                <Image
                  src={ option.selectedImageSrc }
                  width={ option.imageSize.width }
                  height={ option.imageSize.height }
                />
              </div>
            </div>
            : null
        }
        {
          option.iconProps
            ? <div className='ms-ChoiceField-innerField'>
              <div className={ css('ms-ChoiceField-iconWrapper') }>
                <Icon { ...option.iconProps } />
              </div>
            </div>
            : null
        }
        {
          option.imageSrc || option.iconProps
            ? <div className='ms-ChoiceField-labelWrapper'>
              <i className='ms-ChoiceField-icon ms-Icon ms-Icon--CheckMark' />
              <span id={ `${this._labelId}-${option.key}` } className='ms-Label'>{ option.text }</span>
            </div>
            : <span id={ `${this._labelId}-${option.key}` } className='ms-Label'>{ option.text }</span>
        }
      </label>
    );
  }

  private _onChange(option: IChoiceGroupOption, evt: React.FormEvent<HTMLInputElement>) {
    let { onChanged, onChange } = this.props;

    this.setState({
      keyChecked: option.key
    });

    // TODO: onChanged deprecated, remove else if after 07/17/2017 when onChanged has been removed.
    if (onChange) {
      onChange(evt, option);
    } else if (onChanged) {
      onChanged(option);
    }
  }

  /**
   * If all the isChecked property of options are falsy values, return undefined;
   * Else return the key of the first option with the truthy isChecked property.
   */
  private _getKeyChecked(options: IChoiceGroupOption[]): string {
    const optionsChecked = options.filter((option: IChoiceGroupOption) => {
      return option.isChecked || option.checked;
    });

    if (optionsChecked.length === 0) {
      return undefined;
    } else {
      return optionsChecked[0].key;
    }
  }
}
