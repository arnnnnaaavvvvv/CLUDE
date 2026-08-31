import pytest
from app.services.stack_trace_parser import StackTraceParser


def test_python_traceback_parser():
    raw_python = """Traceback (most recent call last):
  File "app/services/billing.py", line 87, in process_subscription
    charge_amount = plan.get_discounted_rate(user.tier)
AttributeError: 'NoneType' object has no attribute 'get_discounted_rate'"""

    parsed = StackTraceParser.parse(raw_python)
    assert parsed["error_type"] == "AttributeError"
    assert "get_discounted_rate" in parsed["error_message"]
    assert len(parsed["frames"]) == 1
    frame = parsed["frames"][0]
    assert frame.file_path == "app/services/billing.py"
    assert frame.line_number == 87
    assert frame.function_name == "process_subscription"


def test_javascript_v8_stack_parser():
    raw_js = """TypeError: Cannot read properties of undefined (reading 'calculateTax')
    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)
    at CheckoutController.handleCheckout (src/controllers/checkout.ts:89:12)"""

    parsed = StackTraceParser.parse(raw_js)
    assert parsed["error_type"] == "TypeError"
    assert "calculateTax" in parsed["error_message"]
    assert len(parsed["frames"]) == 2
    assert parsed["frames"][0].file_path == "src/services/payment.ts"
    assert parsed["frames"][0].line_number == 142
    assert parsed["frames"][0].column_number == 28


def test_go_panic_parser():
    raw_go = """panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: code=0x1 addr=0x0 pc=0x10a2f4]

goroutine 1 [running]:
main.DispatchWorker(0x0, 0x1400011c000)
\tsrc/workers/dispatcher.go:73 +0x3c
main.main()
\tsrc/main.go:24 +0x88"""

    parsed = StackTraceParser.parse(raw_go)
    assert parsed["error_type"] == "panic"
    assert len(parsed["frames"]) >= 2
    assert parsed["frames"][0].file_path == "src/workers/dispatcher.go"
    assert parsed["frames"][0].line_number == 73


def test_empty_trace():
    parsed = StackTraceParser.parse("")
    assert parsed["error_type"] == "UnknownError"
    assert parsed["frames"] == []
