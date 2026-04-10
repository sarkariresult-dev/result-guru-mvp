/**
 * Taxonomy Section - State, Organization, Category, Qualifications, Tags.
 * Sidebar panel with searchable selects and smart tag grouping.
 */
'use client'

import { useState } from 'react'
import { usePostForm } from './PostFormContext'
import { Panel, SearchableSelect, SearchableMultiSelect, Field } from './primitives'
import { TYPE_CONFIG } from './type-config'

interface Option { value: string; label: string }
interface TagOption extends Option { tag_type?: string }

interface TaxonomySectionProps {
    states: Option[]
    organizations: Option[]
    categories: Option[]
    qualifications: Option[]
    tags: TagOption[]
}

export function TaxonomySection({ states, organizations, categories, qualifications, tags }: TaxonomySectionProps) {
    const { state, dispatch } = usePostForm()

    return (
        <Panel title="Taxonomy" defaultOpen>
            <Field label="State">
                <SearchableSelect
                    options={states}
                    value={state.stateSlug}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'stateSlug', value: v })}
                    placeholder="Select State…"
                    emptyLabel="Select State…"
                />
            </Field>

            <Field label="Organization">
                <SearchableSelect
                    options={organizations}
                    value={state.organizationId}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'organizationId', value: v })}
                    placeholder="Select Organization…"
                    emptyLabel="Select Organization…"
                />
            </Field>

            <Field label="Category">
                <SearchableSelect
                    options={categories}
                    value={state.categoryId}
                    onChange={v => dispatch({ type: 'SET_FIELD', field: 'categoryId', value: v })}
                    placeholder="Select Category…"
                    emptyLabel="Select Category…"
                />
            </Field>

            <Field label="Qualifications">
                <SearchableMultiSelect
                    options={qualifications}
                    value={state.qualifications}
                    onChange={slugs => dispatch({ type: 'SET_QUALIFICATIONS', slugs })}
                    placeholder="Select Qualifications…"
                />
            </Field>

            <Field label="Tags">
                <SearchableMultiSelect
                    options={tags}
                    value={state.tagIds}
                    onChange={tagIds => dispatch({ type: 'SET_TAGS', tagIds })}
                    placeholder="Select Tags…"
                />
            </Field>
        </Panel>
    )
}
