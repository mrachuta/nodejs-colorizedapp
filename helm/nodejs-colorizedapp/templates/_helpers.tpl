{{/*
Expand the name of the chart.
*/}}
{{- define "nodejs-colorizedapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "nodejs-colorizedapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "nodejs-colorizedapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "nodejs-colorizedapp.labels" -}}
helm.sh/chart: {{ include "nodejs-colorizedapp.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nodejs-colorizedapp.selectorLabels" -}}
{{- $top := index . 0 -}}
{{- $deployment := index . 1 -}}
{{- $appver := index . 2 -}}
app.kubernetes.io/name: {{ include "nodejs-colorizedapp.name" $top }}
app.kubernetes.io/instance: {{ $top.Release.Name }}
app.kubernetes.io/version: {{ $appver | quote }}
istio/deployment: {{ $deployment }}
{{- end }}

{{/*
Create the name of the service account to use - d1 deployment
*/}}
{{- define "nodejs-colorizedapp.serviceAccountName-d1" -}}
{{- if .Values.deployments.d1.serviceAccount.create }}
{{- default (include "nodejs-colorizedapp.fullname" .) .Values.deployments.d1.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.deployments.d1.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use - d2 deployment
*/}}
{{- define "nodejs-colorizedapp.serviceAccountName-d2" -}}
{{- if .Values.deployments.d2.serviceAccount.create }}
{{- default (include "nodejs-colorizedapp.fullname" .) .Values.deployments.d2.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.deployments.d2.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of TLS secret for ingress
*/}}
{{- define "nodejs-colorizedapp.tlsSecretName" -}}
{{- if .Values.ingress.tls.enabled }}
{{- default (printf "%s-cert" .Values.ingress.host | replace "." "-") .Values.ingress.tls.secretName }}
{{- else }}
{{- print "" }}
{{- end }}
{{- end }}

{{/*
Validate and print traffic weight
*/}}
{{- define "nodejs-colorizedapp.trafficWeight" -}}
{{- $top := index . 0 -}}
{{- $deployment:= index . 1 -}}
{{- $weightSum:= add ($top.Values.deployments.d1.weight | int)  ($top.Values.deployments.d2.weight | int) -}}
{{- if gt $weightSum 100 }}
{{- fail ".Values.deployments.d1.weight + .Values.deployments.d1.weight can't exceed 100%" }}
{{- else }}
{{- if eq $deployment "d1" -}}
{{- print $top.Values.deployments.d1.weight | int }}
{{- else if eq $deployment "d2" }}
{{- print $top.Values.deployments.d2.weight | int }}
{{- else }}
{{- fail (printf "%s %s" "Weight for deployment not exist:" $deployment) }}
{{- end }}
{{- end }}
{{- end }}
