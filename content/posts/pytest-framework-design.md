---
title: "自动化测试框架搭建：从 pytest + fixture 到工程化测试体系"
date: 2026-10-20T09:00:00+08:00
draft: false
categories:
  - 自动化测试
  - 测试开发
tags:
  - pytest
  - fixture
  - 自动化框架
  - 工程化测试
description: "从 pytest 的基础用法出发，逐步扩展到稳定的自动化测试框架设计思路。"
---

自动化测试框架搭建最容易踩的坑，不是“没有技术能力”，而是“脚本写得太快、系统设计太弱”。

很多人刚开始都会写这样的代码：

```python
def test_login():
    client = requests.Session()
    res = client.post("https://example.com/login", json={"username": "test", "password": "123"})
    assert res.status_code == 200
