<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id'               => ['nullable', 'integer', 'exists:programs,id'],
            'name'                    => ['required', 'string', 'max:100'],
            'slug'                    => ['nullable', 'string', 'max:60', 'unique:programs,slug'],
            'category'                => ['nullable', 'string', 'max:60'],
            'icon'                    => ['nullable', 'string', 'max:10'],
            'color'                   => ['nullable', 'string', 'max:20'],
            'commission'              => ['nullable', 'string', 'max:60'],
            'link_type'               => ['required', 'in:onetime,permanent'],
            'prefix'                  => ['nullable', 'in:tools,deals,get,start,root'],
            'affiliate_dashboard_url' => ['nullable', 'url', 'max:500'],
            'referral_benefit'        => ['nullable', 'string', 'max:1000'],
            'exclusive_note'          => ['nullable', 'string', 'max:200'],
            'last_verified_at'        => ['nullable', 'date'],
            'login_email'             => ['nullable', 'string', 'max:200'],
            'login_password'          => ['nullable', 'string', 'max:200'],
            'login_method'            => ['nullable', 'string', 'max:100'],
            'low_queue_threshold'      => ['nullable', 'integer', 'min:1', 'max:50'],
            'critical_queue_threshold' => ['nullable', 'integer', 'min:1', 'max:20'],
            'initial_links'           => ['nullable', 'array'],
            'initial_links.*'         => ['url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'A program name is required.',
            'link_type.in'     => 'Link type must be onetime or permanent.',
            'slug.unique'      => 'This slug is already taken. Choose another.',
            'initial_links.*.url' => 'Each initial link must be a valid URL.',
        ];
    }
}
