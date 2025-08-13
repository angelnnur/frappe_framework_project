# Copyright (c) 2025, Angelina and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import requests


class Client(Document):
	@frappe.whitelist()
	def get_suggestions(self, query):
		responceFromApi = self.send_request_to_api("suggest/party", query)
		return responceFromApi.get("suggestions", [])
		
	@frappe.whitelist()
	def get_address_by_inn(self, query):
		if not query:
			frappe.throw("Ошибка ИНН не указан!")
		responceFromApi = self.send_request_to_api("findById/party", query)
		suggestions = responceFromApi.get("suggestions", [])

		if not suggestions:
			frappe.throw(f"Адрес по ИНН: {query} не найден!")

		address = suggestions[0]["data"]["address"]
		return address
	
	@staticmethod
	def send_request_to_api(api_method, query):
		token = frappe.get_conf().get("dadata_token")
		url = frappe.get_conf().get("dadata_url") + api_method

		headers = {
			"Authorization": f"Token {token}",
			"Content-Type": "application/json"
		}
		data = {"query": query}
		resp = requests.post(url, json=data, headers=headers)

		if resp.status_code != 200:
			frappe.throw(f"Ошибка Dadata: {resp.status_code}")

		return resp.json()
