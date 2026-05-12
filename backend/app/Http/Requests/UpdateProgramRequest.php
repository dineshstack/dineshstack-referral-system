<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programId = $this->route('program')?->id;

        return [
            'parent_id'               => ['nullable', 'integer', 'exists:programs,id'],
            'name'                    => ['sometimes', 'string', 'max:100'],
            'slug'                    => ['sometimes', 'string', 'max:60', Rule::unique('programs')->ignore($programId)],
            'category'                => ['nullable', 'string', 'max:60'],
            'icon'                    => ['nullable', 'string', 'max:10'],
            'color'                   => ['nullable', 'string', 'max:20'],
            'commission'              => ['nullable', 'string', 'max:60'],
            'promo_code'              => ['nullable', 'string', 'max:100'],
            'link_type'               => ['sometimes', 'in:onetime,permanent'],
            'prefix'                  => ['sometimes', 'in:tools,deals,get,start,root'],
            'affiliate_dashboard_url' => ['nullable', 'url', 'max:500'],
            'referral_benefit'        => ['nullable', 'string', 'max:1000'],
            'exclusive_note'          => ['nullable', 'string', 'max:200'],
            'last_verified_at'        => ['nullable', 'date'],
            'login_email'             => ['nullable', 'string', 'max:200'],
            'login_password'          => ['nullable', 'string', 'max:200'],
            'login_method'            => ['nullable', 'string', 'max:100'],
            'low_queue_threshold'      => ['nullable', 'integer', 'min:1', 'max:50'],
            'critical_queue_threshold' => ['nullable', 'integer', 'min:1', 'max:20'],
            'is_active'               => ['sometimes', 'boolean'],
            'is_public'               => ['sometimes', 'boolean'],
        ];
    }
}
