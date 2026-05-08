<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddLinksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'links'   => ['required', 'array', 'min:1', 'max:100'],
            'links.*' => ['required', 'url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'links.required'  => 'Provide at least one referral link.',
            'links.*.url'     => 'Each entry must be a valid URL.',
            'links.*.max'     => 'URLs must be 500 characters or fewer.',
        ];
    }
}
